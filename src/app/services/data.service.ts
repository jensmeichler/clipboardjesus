import {Injectable} from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {BehaviorSubject} from "rxjs";
import {SaveAsDialogComponent} from "../components/dialogs/save-as-dialog/save-as-dialog.component";
import {DraggableNote, Image, Note, Tab, TaskList} from "../models";
import {CacheService} from "./cache.service";
import {FileService} from "./file.service";
import {HashyService} from "./hashy.service";

@Injectable({
  providedIn: 'root'
})
export class DataService {
  currentTabIndex = 0;
  tabs: Tab[] = [];

  notes$: BehaviorSubject<Note[] | null> = new BehaviorSubject<Note[] | null>(null);
  taskLists$: BehaviorSubject<TaskList[] | null> = new BehaviorSubject<TaskList[] | null>(null);
  images$: BehaviorSubject<Image[] | null> = new BehaviorSubject<Image[] | null>(null);

  itemsCount = 0;
  selectedItemsCount = 0;

  redoPossible = this.cache.redoPossible;
  undoPossible = this.cache.undoPossible;

  private colorizedObjects: (Note | TaskList)[] = [];

  constructor(
    private readonly dialog: MatDialog,
    private readonly hashy: HashyService,
    private readonly cache: CacheService,
    private readonly fileService: FileService
  ) {
    for (let i = 0; i < 20; i++) {
      const tab = this.cache.fetch(i);
      if (tab) {
        tab.index = i;
        this.tabs.push(tab);
      }
    }

    this.fetchDataFromCache(0, true);
    this.setColorizedObjects();

    if (!this.tabs.length) {
      this.addTab();
    }
  }

  private static compareNote(left: Note, right: Note): boolean {
    return left.content === right.content
      && left.header === right.header
      && left.posX === right.posX
      && left.posY === right.posY
  }

  private static compareTaskList(left: TaskList, right: TaskList): boolean {
    return left.header === right.header
      && left.posX === right.posX
      && left.posY === right.posY
  }

  private static compareImage(left: Image, right: Image): boolean {
    return left.source === right.source
      && left.posX === right.posX
      && left.posY === right.posY
  }

  private static compareColors(left: Note | TaskList, right: Note | TaskList): boolean {
    if (left && right) {
      return left.backgroundColor == right.backgroundColor
        && left.backgroundColorGradient == right.backgroundColorGradient
        && left.foregroundColor == right.foregroundColor
    } else {
      return false;
    }
  }

  undo() {
    if (this.cache.undo(this.currentTabIndex)) {
      this.setSelectedTab(this.currentTabIndex, true);
    }
  }

  redo() {
    if (this.cache.redo(this.currentTabIndex)) {
      this.setSelectedTab(this.currentTabIndex, true);
    }
  }

  getColorizedObjects(excludedItem: Note | TaskList): (Note | TaskList)[] {
    return this.colorizedObjects.filter(item => !DataService.compareColors(excludedItem, item));
  }

  selectAll() {
    this.editAllItems(item => item.selected = true);
    this.selectedItemsCount = this.itemsCount;
  }

  removeAllSelections() {
    this.editAllItems(item => item.selected = undefined);
    this.selectedItemsCount = 0;
  }

  editAllSelectedItems(action: (item: Note | TaskList | Image) => void) {
    this.editAllItems(x => x.selected ? action(x) : {})
  }

  editAllItems(action: (item: Note | TaskList | Image) => void) {
    let notes = this.notes$.getValue();
    let taskLists = this.taskLists$.getValue();
    let images = this.images$.getValue();

    notes?.forEach(action);
    taskLists?.forEach(action);
    images?.forEach(action);

    this.notes$.next(notes);
    this.taskLists$.next(taskLists);
    this.images$.next(images);
  }

  filterAllItems(action: (item: Note | TaskList | Image) => boolean) {
    let notes = this.notes$.getValue()?.filter(action);
    let taskLists = this.taskLists$.getValue()?.filter(action);
    let images = this.images$.getValue()?.filter(action);

    this.notes$.next(notes ?? []);
    this.taskLists$.next(taskLists ?? []);
    this.images$.next(images ?? []);
  }

  cacheData() {
    this.cache.save(this.currentTabIndex, this.getAsJson(true));
    this.setColorizedObjects();
  }

  fetchDataFromCache(tabId?: number, skipCache?: boolean) {
    if (tabId != undefined) {
      this.currentTabIndex = tabId;
    }
    let tab = this.cache.fetch(this.currentTabIndex);
    if (tab) {
      this.setFromTabJson(tab, skipCache);
    }
  }

  addTab(tab?: Tab) {
    if (tab) {
      tab.index = this.tabs.length;
    }
    const newTab = tab ?? {
      index: this.tabs.length,
      color: '#131313',
      notes: [],
      taskLists: [],
      images: []
    } as Tab;
    this.tabs.push(newTab);
    this.cache.save(newTab.index, newTab);
    this.setSelectedTab(newTab.index, true);
  }

  async canImportItemsFromClipboard(): Promise<boolean> {
    const clipboardText = await navigator.clipboard.readText();
    if (!clipboardText) {
      return false;
    }

    try {
      let tab = JSON.parse(clipboardText) as Tab;
      return !!(tab.notes.length || tab.taskLists.length || tab.images.length);
    } catch {
      return false;
    }
  }

  async importItemsFromClipboard(): Promise<boolean> {
    const clipboardText = await navigator.clipboard.readText();
    if (!clipboardText) {
      return false;
    }

    try {
      let tab = JSON.parse(clipboardText) as Tab;
      if (tab.notes.length) {
        tab.notes.forEach(note => this.addNote(note));
      }
      if (tab.taskLists.length) {
        tab.taskLists.forEach(taskList => this.addTaskList(taskList));
      }
      if (tab.images.length) {
        tab.images.forEach(image => this.addImage(image));
      }
    } catch {
      this.addNote(new Note(10, 61, clipboardText));
    }

    this.cacheData();
    return true;
  }

  removeTab() {
    let index = this.currentTabIndex;
    this.cache.remove(index);

    let result = this.tabs.filter(tab => tab.index < index);
    let rightTabs = this.tabs.filter(tab => tab.index > index);
    rightTabs.forEach(tab => {
      const oldIndex = tab.index;
      const newIndex = tab.index - 1;

      let tabContent = this.cache.fetch(oldIndex);
      this.cache.remove(oldIndex);
      this.cache.save(newIndex, tabContent!)

      tab.index--;
      result.push(tab);
    })
    this.tabs = result;

    let isRightTab = index > (this.tabs.length - 1);
    this.clearAllData();
    this.fetchDataFromCache(isRightTab ? index - 1 : index, true);
  }

  reArrangeTab(sourceIndex: number, targetIndex: number) {
    let sourceTab = this.cache.fetch(sourceIndex);
    let targetTab = this.cache.fetch(targetIndex);

    this.cache.remove(sourceIndex);
    this.cache.remove(targetIndex);

    if (sourceTab) {
      this.cache.save(targetIndex, sourceTab)
    }
    if (targetTab) {
      this.cache.save(sourceIndex, targetTab)
    }

    this.tabs.forEach(tab => {
      if (tab.index == sourceIndex) {
        tab.index = targetIndex;
      } else if (tab.index == targetIndex) {
        tab.index = sourceIndex;
      }
    })
  }

  setSelectedTab(index: number, skipCache?: boolean) {
    this.currentTabIndex = index;
    this.clearAllData();
    this.fetchDataFromCache(index, skipCache);
  };

  clearAllData() {
    this.notes$.next([]);
    this.taskLists$.next([]);
    this.images$.next([]);
    this.itemsCount = 0;
    this.selectedItemsCount = 0;
  }

  clearSelection() {
    this.editAllItems(item => item.selected = false);
    this.selectedItemsCount = 0;
    this.cacheData();
  }

  deleteSelectedItems() {
    this.filterAllItems(item => !item.selected)
    this.selectedItemsCount = 0;
    this.cacheData();
  }

  clearCache() {
    for (let i = 0; i < 20; i++) {
      this.cache.remove(i);
    }
    this.currentTabIndex = 0;
    this.tabs = [];
    this.clearAllData();
    this.addTab();
  }

  onSelectionChange(item: { selected?: boolean }) {
    if (item.selected) {
      this.selectedItemsCount++;
    } else {
      this.selectedItemsCount--;
    }
  }

  addNote(note: Note) {
    this.defineIndex(note);
    let currentNotes = this.notes$.getValue() ?? [];
    currentNotes?.push(note);
    this.notes$.next(currentNotes);
    this.itemsCount++;

    this.cacheData();
  }

  addTaskList(taskList: TaskList) {
    this.defineIndex(taskList);
    let currentTasks = this.taskLists$.getValue() ?? [];
    currentTasks?.push(taskList);
    this.taskLists$.next(currentTasks);
    this.itemsCount++;

    this.cacheData();
  }

  addImage(image: Image) {
    this.defineIndex(image);
    let currentImages = this.images$.getValue() ?? [];
    currentImages?.push(image);
    this.images$.next(currentImages);
    this.itemsCount++;

    this.cacheData();
  }

  deleteNote(note: Note, skipIndexing?: boolean) {
    this.itemsCount--;
    if (note.selected) {
      this.selectedItemsCount--;
    }

    let notes = this.notes$.getValue();
    let filteredNotes = notes!.filter(x => x !== note);
    this.notes$.next(filteredNotes!);

    if (!skipIndexing) {
      this.reArrangeIndices();
    }
  }

  deleteTaskList(taskList: TaskList, skipIndexing?: boolean) {
    this.itemsCount--;
    if (taskList.selected) {
      this.selectedItemsCount--;
    }

    let taskLists = this.taskLists$.getValue();
    let filteredTaskLists = taskLists!.filter(x => x !== taskList);
    this.taskLists$.next(filteredTaskLists!);

    if (!skipIndexing) {
      this.reArrangeIndices();
    }
  }

  deleteImage(image: Image) {
    this.itemsCount--;
    if (image.selected) {
      this.selectedItemsCount--;
    }

    let images = this.images$.getValue();
    let filteredImages = images!.filter(x => x !== image);
    this.images$.next(filteredImages!);

    this.reArrangeIndices();
  }

  getSelectedItems(): Tab {
    let tab = {
      notes: this.notes$.getValue()?.filter(x => x.selected),
      taskLists: this.taskLists$.getValue()?.filter(x => x.selected),
      images: this.images$.getValue()?.filter(x => x.selected),
    } as Tab;
    tab = JSON.parse(JSON.stringify(tab));
    tab.notes.forEach(note => note.selected = false);
    tab.taskLists.forEach(taskList => taskList.selected = false);
    tab.images.forEach(image => image.selected = false);
    return tab;
  }

  getAsJson(ignoreSelection?: boolean): Tab {
    const label = this.tabs[this.currentTabIndex].label
      ? this.tabs[this.currentTabIndex].label
      : undefined;
    const color = this.tabs[this.currentTabIndex].color
      ? this.tabs[this.currentTabIndex].color
      : undefined;
    if (!ignoreSelection && this.selectedItemsCount) {
      return this.getSelectedItems();
    }
    return {
      label, color,
      notes: this.notes$.getValue(),
      taskLists: this.taskLists$.getValue(),
      images: this.images$.getValue()
    } as Tab;
  }

  setFromTabsJson(tabs: Tab[]) {
    this.clearCache();

    let i = 0;
    tabs.forEach(tab => {
      this.currentTabIndex = i++;
      this.setFromTabJson(tab);
      this.clearAllData();
    });

    this.setSelectedTab(0);
  }

  setFromTabJson(tab: Tab, skipCache?: boolean) {
    let currentNotes: Note[] = this.notes$.getValue() ?? [];
    let currentTaskLists: TaskList[] = this.taskLists$.getValue() ?? [];
    let currentImages: Image[] = this.images$.getValue() ?? [];

    let uploadedNotes = tab.notes;
    let uploadedTaskLists = tab.taskLists;
    let uploadedImages = tab.images;

    uploadedNotes?.forEach((upload: Note) => {
      if (!currentNotes.some(curr => DataService.compareNote(upload, curr))) {
        currentNotes.push(upload);
        this.itemsCount++;
        if (upload.selected) {
          this.onSelectionChange(upload);
        }
      }
    });
    uploadedTaskLists?.forEach((upload: TaskList) => {
      if (!currentTaskLists.some(curr => DataService.compareTaskList(upload, curr))) {
        currentTaskLists.push(upload);
        this.itemsCount++;
        if (upload.selected) {
          this.onSelectionChange(upload);
        }
      }
    });
    uploadedImages?.forEach((upload: Image) => {
      if (!currentImages.some(curr => DataService.compareImage(upload, curr))) {
        currentImages.push(upload);
        this.itemsCount++;
        if (upload.selected) {
          this.onSelectionChange(upload);
        }
      }
    });

    tab.index = this.currentTabIndex;
    const currentTab = this.tabs[this.currentTabIndex];
    if (currentTab) {
      if (!tab.label) {
        tab.label = currentTab.label;
      }
      if (!tab.color || tab.color == '#131313') {
        tab.color = currentTab.color;
      }
      this.tabs[this.currentTabIndex] = tab;
      this.notes$.next(currentNotes);
      this.taskLists$.next(currentTaskLists);
      this.images$.next(currentImages);
      if (!skipCache) {
        this.cacheData();
      }
    } else {
      this.addTab(tab);
    }

    this.reArrangeIndices();
  }

  saveAllAs() {
    this.dialog.open(SaveAsDialogComponent, {
      position: {
        bottom: '90px',
        right: 'var(--margin-edge)'
      }
    }).afterClosed().subscribe(filename => {
      if (filename) {
        this.saveAll(filename);
      }
    });
  }

  saveAll(filename?: string) {
    const json = this.cache.getJsonFromAll();
    const savedAs = this.fileService.save(JSON.stringify(json), 'boards.json', filename);
    this.hashy.show('Saved all tabs as ' + savedAs, 3000, 'Ok');
  }

  saveTabOrSelection(filename?: string) {
    const json = this.getAsJson();
    this.removeAllSelections();
    const savedAs = this.fileService.save(JSON.stringify(json), 'notes.json', filename);
    this.hashy.show('Saved as ' + savedAs, 3000, 'Ok');
    this.cacheData();
  }

  bringToFront(item: { posZ?: number }) {
    item.posZ = this.getNextIndex();
    this.reArrangeIndices();
  }

  bringForward(item: DraggableNote) {
    item.posZ! += 1.5;
    this.reArrangeIndices();
  }

  sendBackward(item: DraggableNote) {
    item.posZ! -= 1.5;
    this.reArrangeIndices();
  }

  flipToBack(item: DraggableNote) {
    item.posZ = 0;
    this.reArrangeIndices();
  }

  moveNoteToTab(index: number, note: Note) {
    let otherTab = this.cache.fetch(index)!;
    otherTab.notes.push(note);
    this.deleteNote(note);
    this.cache.save(index, otherTab);
  }

  moveTaskListToTab(index: number, taskList: TaskList) {
    let otherTab = this.cache.fetch(index)!;
    otherTab.taskLists.push(taskList);
    this.deleteTaskList(taskList);
    this.cache.save(index, otherTab);
  }

  moveImageToTab(index: number, image: Image) {
    let otherTab = this.cache.fetch(index)!;
    otherTab.images.push(image);
    this.deleteImage(image);
    this.cache.save(index, otherTab);
  }

  setColorizedObjects() {
    this.colorizedObjects = [];
    const notes = this.notes$.getValue();
    const taskLists = this.taskLists$.getValue();
    notes?.forEach(note => {
      if (!this.colorizedObjects.some(other => DataService.compareColors(note, other))) {
        this.colorizedObjects.push(note);
      }
    })
    taskLists?.forEach(taskList => {
      if (!this.colorizedObjects.some(other => DataService.compareColors(taskList, other))) {
        this.colorizedObjects.push(taskList);
      }
    })
  }

  selectNextTab(revert: boolean) {
    if (!((this.currentTabIndex == 0 && revert) || (this.currentTabIndex == (this.tabs.length - 1) && !revert))) {
      this.setSelectedTab(revert ? this.currentTabIndex - 1 : this.currentTabIndex + 1);
    }
  }

  selectNextItem(revert: boolean) {
    let notes = this.notes$.getValue();
    let taskLists = this.taskLists$.getValue();
    let images = this.images$.getValue();

    if (this.selectedItemsCount == 0) {
      if (notes?.length) {
        this.selectFirst(notes);
      } else if (taskLists?.length) {
        this.selectFirst(taskLists);
      } else if (images?.length) {
        this.selectFirst(images);
      }
    } else if (this.selectedItemsCount == 1) {
      const selectedNotes = notes?.filter(x => x.selected);
      const selectedTaskLists = taskLists?.filter(x => x.selected);
      const selectedImages = images?.filter(x => x.selected);

      let currentIndex: number | undefined;
      if (selectedNotes?.length) {
        currentIndex = selectedNotes[0].posZ!;
        selectedNotes[0].selected = false;
        this.onSelectionChange(selectedNotes[0]);
      } else if (selectedTaskLists?.length) {
        currentIndex = selectedTaskLists[0].posZ!;
        selectedTaskLists[0].selected = false;
        this.onSelectionChange(selectedTaskLists[0]);
      } else if (selectedImages?.length) {
        currentIndex = selectedImages[0].posZ!;
        selectedImages[0].selected = false;
        this.onSelectionChange(selectedImages[0]);
      }

      if (currentIndex == undefined) {
        return;
      } else {
        currentIndex = revert ? currentIndex - 1 : currentIndex + 1;
      }

      const possibleNextSelectedNotes = notes?.filter(x => x.posZ == currentIndex);
      const possibleNextSelectedTaskLists = taskLists?.filter(x => x.posZ == currentIndex);
      const possibleNextSelectedImages = images?.filter(x => x.posZ == currentIndex);

      if (possibleNextSelectedNotes?.length) {
        this.selectFirst(possibleNextSelectedNotes);
        return;
      } else if (possibleNextSelectedTaskLists?.length) {
        this.selectFirst(possibleNextSelectedTaskLists);
        return;
      } else if (possibleNextSelectedImages?.length) {
        this.selectFirst(possibleNextSelectedImages);
        return;
      }
    }
  }

  private selectFirst(list: DraggableNote[]) {
    if (list.length == 1) {
      list[0].selected = true;
      this.onSelectionChange(list[0]);
      return;
    }
    const minIndex = list.reduce((index, draggable) => Math.min(index, draggable.posZ ?? Number.MAX_VALUE), Number.MAX_VALUE);
    const firstItems = list.filter(x => x.posZ == minIndex);
    if (firstItems.length) {
      firstItems[0].selected = true;
      this.onSelectionChange(firstItems[0]);
    } else {
      list[0].selected = true;
      this.onSelectionChange(list[0]);
    }
  }

  private defineIndex(item: Note | TaskList | Image) {
    if (item.posZ == undefined) {
      item.posZ = this.getNextIndex();
    }
  }

  private reArrangeIndices() {
    let indexItems = this.getIndexItems()
      .sort((a, b) => (a.posZ ?? 0) - (b.posZ ?? 0));
    let i = 1;
    indexItems.forEach(item => {
      item.posZ = i++;
    })

    this.cacheData();
  }

  private getNextIndex(): number {
    let highestItem = this.getIndexItems()
      ?.filter(n => n.posZ)
      ?.reduce((hn, n) => Math.max(hn, n.posZ!), 0);

    return highestItem
      ? highestItem + 1
      : 1
  }

  private getIndexItems(): DraggableNote[] {
    let notes = this.notes$.getValue() as DraggableNote[];
    let taskLists = this.taskLists$.getValue() as DraggableNote[];
    let images = this.images$.getValue() as DraggableNote[];
    let result: DraggableNote[] = [];

    if (notes) {
      result = result.concat(notes);
    }
    if (taskLists) {
      result = result.concat(taskLists);
    }
    if (images) {
      result = result.concat(images);
    }
    return result;
  }
}
