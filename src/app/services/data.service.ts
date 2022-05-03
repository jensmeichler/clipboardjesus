import {Injectable} from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {SaveAsDialogComponent} from "../components/dialogs/save-as-dialog/save-as-dialog.component";
import {DraggableNote, Image, Note, Tab, TaskList} from "../models";
import {CacheService} from "./cache.service";
import {FileService} from "./file.service";
import {HashyService} from "./hashy.service";
import {NoteList} from "../models/note-list.model";

@Injectable({
  providedIn: 'root'
})
export class DataService {
  selectedTabIndex = 0;
  tabs: Tab[] = [];

  redoPossible = this.cache.redoPossible;
  undoPossible = this.cache.undoPossible;
  restorePossible = this.cache.restorePossible;

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
    if (!this.tabs.length) this.addTab();

    this.selectedTabIndex = 0;
    this.setColorizedObjects();
  }

  get itemsCount(): number {
    return this.tab.notes.length + this.tab.taskLists.length + this.tab.images.length;
  }

  get selectedItemsCount(): number {
    return this.tab.notes.filter(x => x.selected).length
      + this.tab.taskLists.filter(x => x.selected).length
      + this.tab.images.filter(x => x.selected).length;
  }

  get tab(): Tab {
    return this.tabs[this.selectedTabIndex];
  }

  set tab(tab: Tab) {
    if (!tab) debugger;
    this.tabs[this.selectedTabIndex] = tab;
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
    if (!left || !right) return false;
    return left.backgroundColor === right.backgroundColor
      && left.backgroundColorGradient === right.backgroundColorGradient
      && left.foregroundColor === right.foregroundColor
  }

  undo() {
    if (this.cache.undo(this.selectedTabIndex)) {
      this.tab = this.cache.fetch(this.selectedTabIndex)!;
    }
  }

  redo() {
    if (this.cache.redo(this.selectedTabIndex)) {
      this.tab = this.cache.fetch(this.selectedTabIndex)!;
    }
  }

  restoreTab() {
    const recreatedTab = this.cache.recreate();
    if (recreatedTab) this.addTab(recreatedTab);
  }

  getColorizedObjects(excludedItem: Note | TaskList): (Note | TaskList)[] {
    return this.colorizedObjects.filter(item => !DataService.compareColors(excludedItem, item));
  }

  selectAll() {
    this.editAllItems(item => item.selected = true);
  }

  removeAllSelections() {
    this.editAllItems(item => item.selected = undefined);
  }

  editAllSelectedItems(action: (item: DraggableNote) => void) {
    this.editAllItems(x => x.selected ? action(x) : {})
  }

  editAllItems(action: (item: DraggableNote) => void) {
    this.tab.notes.forEach(action);
    this.tab.taskLists.forEach(action);
    this.tab.images.forEach(action);
  }

  filterAllItems(action: (item: DraggableNote) => boolean) {
    this.tab.notes = this.tab.notes.filter(action);
    this.tab.taskLists = this.tab.taskLists.filter(action);
    this.tab.images = this.tab.images.filter(action);
  }

  cacheData() {
    this.cache.save(this.selectedTabIndex, this.getAsJson(true));
    this.setColorizedObjects();
  }

  cacheAllData() {
    const currentTabIndex = this.selectedTabIndex;
    this.tabs.forEach(tab => {
      this.selectedTabIndex = tab.index;
      this.cache.save(this.selectedTabIndex, this.getAsJson(true));
    })
    this.selectedTabIndex = currentTabIndex;
    this.setColorizedObjects();
  }

  addTab(tab?: Tab) {
    if (tab) tab.index = this.tabs.length;
    const newTab: Tab = tab ?? {
      index: this.tabs.length,
      color: '#131313',
      notes: [],
      noteLists: [],
      taskLists: [],
      images: []
    };
    this.tabs.push(newTab);
    this.cache.save(newTab.index, newTab);
    this.selectedTabIndex = newTab.index;
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
    if (!clipboardText) return false;

    try {
      let tab = JSON.parse(clipboardText) as Tab;
      if (tab.notes.length) tab.notes.forEach(note => this.addNote(note));
      if (tab.taskLists.length) tab.taskLists.forEach(taskList => this.addTaskList(taskList));
      if (tab.images.length) tab.images.forEach(image => this.addImage(image));
    } catch {
      this.addNote(new Note(10, 61, clipboardText));
    }

    this.cacheData();
    return true;
  }

  removeTab() {
    let index = this.selectedTabIndex;
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
    this.selectedTabIndex = isRightTab ? index - 1 : index;
  }

  reArrangeTab(sourceIndex: number, targetIndex: number) {
    let sourceTabCopy = JSON.parse(JSON.stringify(this.tabs[sourceIndex])) as Tab;
    let targetTabCopy = JSON.parse(JSON.stringify(this.tabs[targetIndex])) as Tab;

    this.cache.remove(sourceIndex);
    this.cache.remove(targetIndex);

    sourceTabCopy.index = targetIndex;
    targetTabCopy.index = sourceIndex;

    this.tabs[targetIndex] = sourceTabCopy;
    this.tabs[sourceIndex] = targetTabCopy;

    this.cache.save(targetIndex, sourceTabCopy)
    this.cache.save(sourceIndex, targetTabCopy)

    this.selectedTabIndex = targetIndex;
  }

  clearSelection() {
    this.editAllItems(item => item.selected = false);
    this.cacheData();
  }

  deleteSelectedItems() {
    this.filterAllItems(item => !item.selected)
    this.cacheData();
  }

  clearCache() {
    for (let i = 0; i < 20; i++) {
      this.cache.remove(i);
    }
    this.selectedTabIndex = 0;
    this.tabs = [];
    this.addTab();
  }

  addNote(note: Note) {
    this.defineIndex(note);
    this.tab.notes.push(note);
    this.cacheData();
  }

  addNoteList(noteList: NoteList) {
    this.defineIndex(noteList);
    this.tab.noteLists.push(noteList);
    this.cacheData();
  }

  addTaskList(taskList: TaskList) {
    this.defineIndex(taskList);
    this.tab.taskLists.push(taskList);
    this.cacheData();
  }

  addImage(image: Image) {
    this.defineIndex(image);
    this.tab.images.push(image);
    this.cacheData();
  }

  deleteNote(note: Note, skipIndexing?: boolean) {
    this.tab.notes = this.tab.notes.filter(x => x !== note);
    if (!skipIndexing) {
      this.reArrangeIndices();
      this.cacheData();
    }
  }

  deleteTaskList(taskList: TaskList, skipIndexing?: boolean) {
    this.tab.taskLists = this.tab.taskLists.filter(x => x !== taskList);
    if (!skipIndexing) {
      this.reArrangeIndices();
      this.cacheData();
    }
  }

  deleteImage(image: Image) {
    this.tab.images = this.tab.images.filter(x => x !== image);
    this.reArrangeIndices();
    this.cacheData();
  }

  getSelectedItems(): Tab {
    let tab = JSON.parse(JSON.stringify(this.tab)) as Tab;

    tab.notes = tab.notes.filter(x => x.selected);
    tab.taskLists = tab.taskLists.filter(x => x.selected);
    tab.images = tab.images.filter(x => x.selected);

    tab.notes.forEach(note => note.selected = false);
    tab.taskLists.forEach(taskList => taskList.selected = false);
    tab.images.forEach(image => image.selected = false);

    return tab;
  }

  getAsJson(ignoreSelection?: boolean): Tab {
    if (ignoreSelection || !this.selectedItemsCount) return this.tab;
    return this.getSelectedItems();
  }

  setFromTabJson(tab: Tab, skipCache?: boolean) {
    tab.notes.forEach(note => {
      if (!this.tab.notes.some(curr => DataService.compareNote(note, curr))) {
        this.tab.notes.push(note);
      }
    });
    tab.taskLists.forEach(taskList => {
      if (!this.tab.taskLists.some(curr => DataService.compareTaskList(taskList, curr))) {
        this.tab.taskLists.push(taskList);
      }
    });
    tab.images.forEach(image => {
      if (!this.tab.images.some(curr => DataService.compareImage(image, curr))) {
        this.tab.images.push(image);
      }
    });

    if (!skipCache) this.cacheData();
    this.reArrangeIndices();
  }

  saveAllAs() {
    this.dialog.open(SaveAsDialogComponent, {
      position: {
        bottom: '90px',
        right: 'var(--margin-edge)'
      }
    }).afterClosed().subscribe(filename => {
      if (filename) this.saveAll(filename);
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

  bringToFront(item: DraggableNote) {
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
    this.tabs[index] = otherTab;
  }

  moveTaskListToTab(index: number, taskList: TaskList) {
    let otherTab = this.cache.fetch(index)!;
    otherTab.taskLists.push(taskList);
    this.deleteTaskList(taskList);
    this.cache.save(index, otherTab);
    this.tabs[index] = otherTab;
  }

  moveImageToTab(index: number, image: Image) {
    let otherTab = this.cache.fetch(index)!;
    otherTab.images.push(image);
    this.deleteImage(image);
    this.cache.save(index, otherTab);
    this.tabs[index] = otherTab;
  }

  setColorizedObjects() {
    this.colorizedObjects = [];
    this.tab.notes?.forEach(note => {
      if (!this.colorizedObjects.some(other => DataService.compareColors(note, other))) {
        this.colorizedObjects.push(note);
      }
    })
    this.tab.taskLists?.forEach(taskList => {
      if (!this.colorizedObjects.some(other => DataService.compareColors(taskList, other))) {
        this.colorizedObjects.push(taskList);
      }
    })
  }

  selectNextTab(revert: boolean) {
    if (!((this.selectedTabIndex == 0 && revert) || (this.selectedTabIndex == (this.tabs.length - 1) && !revert))) {
      this.selectedTabIndex = revert ? this.selectedTabIndex - 1 : this.selectedTabIndex + 1;
    }
  }

  selectNextItem(revert: boolean) {
    let notes = this.tab.notes;
    let taskLists = this.tab.taskLists;
    let images = this.tab.images;

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
      } else if (selectedTaskLists?.length) {
        currentIndex = selectedTaskLists[0].posZ!;
        selectedTaskLists[0].selected = false;
      } else if (selectedImages?.length) {
        currentIndex = selectedImages[0].posZ!;
        selectedImages[0].selected = false;
      }

      if (currentIndex == undefined) return;

      currentIndex = revert ? currentIndex - 1 : currentIndex + 1;

      const possibleNextSelectedNotes = notes?.filter(x => x.posZ == currentIndex);
      const possibleNextSelectedTaskLists = taskLists?.filter(x => x.posZ == currentIndex);
      const possibleNextSelectedImages = images?.filter(x => x.posZ == currentIndex);

      if (possibleNextSelectedNotes?.length) {
        this.selectFirst(possibleNextSelectedNotes);
      } else if (possibleNextSelectedTaskLists?.length) {
        this.selectFirst(possibleNextSelectedTaskLists);
      } else if (possibleNextSelectedImages?.length) {
        this.selectFirst(possibleNextSelectedImages);
      }
    }
  }

  private selectFirst(list: DraggableNote[]) {
    if (list.length == 1) {
      list[0].selected = true;
      return;
    }
    const minIndex = list.reduce((index, draggable) => Math.min(index, draggable.posZ ?? Number.MAX_VALUE), Number.MAX_VALUE);
    const firstItems = list.filter(x => x.posZ == minIndex);
    if (firstItems.length) firstItems[0].selected = true;
    else list[0].selected = true;
  }

  private defineIndex(item: DraggableNote) {
    if (item.posZ === undefined) item.posZ = this.getNextIndex();
  }

  private reArrangeIndices() {
    let indexItems = this.getIndexItems()
      .sort((a, b) => (a.posZ ?? 0) - (b.posZ ?? 0));
    let i = 1;
    indexItems.forEach(item => item.posZ = i++);
  }

  private getNextIndex(): number {
    let highestItem = this.getIndexItems()
      ?.filter(n => n.posZ)
      ?.reduce((hn, n) => Math.max(hn, n.posZ!), 0);
    return highestItem ? highestItem + 1 : 1
  }

  private getIndexItems(): DraggableNote[] {
    let notes = this.tab.notes;
    let taskLists = this.tab.taskLists;
    let images = this.tab.images;

    let result: DraggableNote[] = [];
    if (notes) result = result.concat(notes);
    if (taskLists) result = result.concat(taskLists);
    if (images) result = result.concat(images);

    return result;
  }
}
