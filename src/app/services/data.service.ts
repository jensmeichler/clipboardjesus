import {Injectable} from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import * as moment from "moment";
import {BehaviorSubject} from "rxjs";
import {SaveAsDialogComponent} from "../components/dialogs/save-as-dialog/save-as-dialog.component";
import {Image, IndexItem, Note, Tab, TaskList} from "../models";
import {CacheService} from "./cache.service";
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

  constructor(
    private readonly dialog: MatDialog,
    private readonly hashy: HashyService,
    private readonly cache: CacheService
  ) {
    for (let i = 0; i < 20; i++) {
      const tab = this.cache.fetch(i);
      if (tab) {
        tab.index = i;
        this.tabs.push(tab);
      }
    }

    this.fetchDataFromCache(0);

    if (!this.tabs.length) {
      this.addTab();
    }
  }

  cacheData() {
    this.cache.save(this.currentTabIndex, this.getAsJson(true));
  }

  fetchDataFromCache(tabId?: number) {
    if (tabId != undefined) {
      this.currentTabIndex = tabId;
    }
    let tab = this.cache.fetch(this.currentTabIndex);
    if (tab) {
      this.setFromJson(tab);
    }
  }

  addTab() {
    const newTab = {
      index: this.tabs.length,
      color: '#131313',
      notes: [],
      taskLists: [],
      images: []
    } as Tab;
    this.tabs.push(newTab);
    this.cache.save(newTab.index, newTab);
    this.setSelectedTab(newTab.index);
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
    this.fetchDataFromCache(isRightTab ? index - 1 : index);
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

  setSelectedTab(index: number) {
    this.currentTabIndex = index;
    this.clearAllData();
    this.fetchDataFromCache(index);
  };

  clearAllData() {
    this.notes$.next([]);
    this.taskLists$.next([]);
    this.images$.next([]);
    this.itemsCount = 0;
    this.selectedItemsCount = 0;
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
    this.cacheData();
  }

  async addNote(note: Note) {
    note.content ??= await navigator.clipboard.readText();
    if (!note.content) {
      this.hashy.show('Your clipboard is empty', 3000);
      return;
    }

    if (note.posZ == undefined) {
      note.posZ = this.getNextIndex();
    }
    let currentNotes = this.notes$.getValue() ?? [];
    currentNotes?.push(note);
    this.notes$.next(currentNotes);
    this.itemsCount++;

    this.cacheData();
  }

  addTaskList(taskList: TaskList) {
    if (taskList.posZ == undefined) {
      taskList.posZ = this.getNextIndex();
    }
    let currentTasks = this.taskLists$.getValue() ?? [];
    currentTasks?.push(taskList);
    this.taskLists$.next(currentTasks);
    this.itemsCount++;

    this.cacheData();
  }

  addImage(image: Image) {
    if (image.posZ == undefined) {
      image.posZ = this.getNextIndex();
    }
    let currentImages = this.images$.getValue() ?? [];
    currentImages?.push(image);
    this.images$.next(currentImages);
    this.itemsCount++;

    this.cacheData();
  }

  deleteNote(note: Note) {
    this.itemsCount--;
    if (note.selected) {
      this.selectedItemsCount--;
    }

    let notes = this.notes$.getValue();
    let filteredNotes = notes!.filter(x => x !== note);
    this.notes$.next(filteredNotes!);

    this.reArrangeIndices();
  }

  deleteTaskList(taskList: TaskList) {
    this.itemsCount--;
    if (taskList.selected) {
      this.selectedItemsCount--;
    }

    let taskLists = this.taskLists$.getValue();
    let filteredTaskLists = taskLists!.filter(x => x !== taskList);
    this.taskLists$.next(filteredTaskLists!);

    this.reArrangeIndices();
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

  getAsJson(ignoreSelection?: boolean): Tab {
    const label = this.tabs[this.currentTabIndex].label
      ? this.tabs[this.currentTabIndex].label
      : undefined;
    const color = this.tabs[this.currentTabIndex].color
      ? this.tabs[this.currentTabIndex].color
      : undefined;
    const gradient = this.tabs[this.currentTabIndex].gradient
      ? this.tabs[this.currentTabIndex].gradient
      : undefined;
    if (!ignoreSelection && this.selectedItemsCount) {
      return {
        notes: this.notes$.getValue()?.filter(x => x.selected),
        taskLists: this.taskLists$.getValue()?.filter(x => x.selected),
        images: this.images$.getValue()?.filter(x => x.selected),
      } as Tab
    }
    return {
      label, color, gradient,
      notes: this.notes$.getValue(),
      taskLists: this.taskLists$.getValue(),
      images: this.images$.getValue()
    } as Tab;
  }

  setFromJson(tab: Tab) {
    let currentNotes: Note[] = this.notes$.getValue() ?? [];
    let currentTaskLists: TaskList[] = this.taskLists$.getValue() ?? [];
    let currentImages: Image[] = this.images$.getValue() ?? [];

    let uploadedNotes = tab.notes;
    let uploadedTaskLists = tab.taskLists;
    let uploadedImages = tab.images;

    uploadedNotes?.forEach((upload: Note) => {
      if (!currentNotes.some(curr => {
        return DataService.compareNote(upload, curr);
      })) {
        currentNotes.push(upload);
        this.itemsCount++;
        if (upload.selected) {
          this.onSelectionChange(upload);
        }
      }
    });
    uploadedTaskLists?.forEach((upload: TaskList) => {
      if (!currentTaskLists.some(curr => {
        return DataService.compareTaskList(upload, curr);
      })) {
        currentTaskLists.push(upload);
        this.itemsCount++;
        if (upload.selected) {
          this.onSelectionChange(upload);
        }
      }
    });
    uploadedImages?.forEach((upload: Image) => {
      if (!currentImages.some(curr => {
        return DataService.compareImage(upload, curr);
      })) {
        currentImages.push(upload);
        this.itemsCount++;
        if (upload.selected) {
          this.onSelectionChange(upload);
        }
      }
    });

    tab.index = this.currentTabIndex;
    this.tabs[this.currentTabIndex] = tab;
    this.notes$.next(currentNotes);
    this.taskLists$.next(currentTaskLists);
    this.images$.next(currentImages);

    this.cacheData();
  }

  save(filename?: string) {
    filename ??= moment(new Date()).format('YYYY-MM-DD-HH-mm') + '.notes.json';
    let json = this.getAsJson();

    json.notes.forEach(x => x.selected = undefined);
    json.taskLists.forEach(x => x.selected = undefined);
    json.images.forEach(x => x.selected = undefined);

    let a = document.createElement('a');
    let file = new Blob([JSON.stringify(json)], {type: 'text/plain'});
    a.href = URL.createObjectURL(file);
    a.download = filename;
    a.click();

    this.hashy.show('Saved as ' + filename, 3000, 'Ok');

    this.cacheData();
  }

  saveAs() {
    this.dialog.open(SaveAsDialogComponent, {
      position: {
        bottom: '90px',
        right: 'var(--margin-edge)'
      }
    }).afterClosed().subscribe(filename => {
      if (filename) {
        this.save(filename.endsWith('.notes.json') ? filename : filename + '.notes.json');
      }
    });
  }

  bringToFront(item: { posZ?: number }) {
    item.posZ = this.getNextIndex();
    this.reArrangeIndices();
  }

  bringForward(item: IndexItem) {
    item.posZ! += 1.5;
    this.reArrangeIndices();
  }

  sendBackward(item: IndexItem) {
    item.posZ! -= 1.5;
    this.reArrangeIndices();
  }

  flipToBack(item: IndexItem) {
    item.posZ = 0;
    this.reArrangeIndices();
  }

  private reArrangeIndices() {
    let indexItems = this.getIndexItems()
      .filter(x => x.posZ != undefined)
      .sort((a, b) => a.posZ! - b.posZ!);
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

  private getIndexItems(): IndexItem[] {
    let notes = this.notes$.getValue() as IndexItem[];
    let taskLists = this.taskLists$.getValue() as IndexItem[];
    let images = this.images$.getValue() as IndexItem[];
    let result: IndexItem[] = [];

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
}
