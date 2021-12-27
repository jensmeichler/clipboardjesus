import {Injectable} from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import * as moment from "moment";
import {BehaviorSubject} from "rxjs";
import {SaveAsDialogComponent} from "../components/dialogs/save-as-dialog/save-as-dialog.component";
import {Image, IndexItem, Note, Tab, TaskList} from "../models";
import {HashyService} from "./hashy.service";

@Injectable({
  providedIn: 'root'
})
export class DataService {
  currentTabIndex = 0;
  tabs: number[] = [0];

  notes$: BehaviorSubject<Note[] | null> = new BehaviorSubject<Note[] | null>(null);
  taskLists$: BehaviorSubject<TaskList[] | null> = new BehaviorSubject<TaskList[] | null>(null);
  images$: BehaviorSubject<Image[] | null> = new BehaviorSubject<Image[] | null>(null);

  itemsCount = 0;
  selectedItemsCount = 0;

  constructor(
    private readonly dialog: MatDialog,
    private readonly hashy: HashyService
  ) {
    for (let i = 1; i < 20; i++) {
      const key = "clipboard_data_" + i;
      const data = localStorage.getItem(key);
      if (data) {
        this.tabs.push(i);
      }
    }

    this.fetchDataFromCache(0);
  }

  cacheData() {
    let key = "clipboard_data_" + this.currentTabIndex;
    localStorage.setItem(key, JSON.stringify(this.getAsJson(true)));
  }

  fetchDataFromCache(tabId?: number) {
    if (tabId != undefined) {
      this.currentTabIndex = tabId;
    }
    let key = "clipboard_data_" + this.currentTabIndex;
    let data = localStorage.getItem(key);
    if (data) {
      this.setFromJson(data);
    }
  }

  addTab() {
    const newIndex = this.tabs.length;
    this.tabs.push(newIndex);
    localStorage.setItem("clipboard_data_" + newIndex, JSON.stringify({
      notes: [],
      taskLists: [],
      images: []
    } as Tab))
  }

  removeTab() {
    let index = this.currentTabIndex;
    let key: string = "clipboard_data_" + index;
    localStorage.removeItem(key);

    let result = this.tabs.filter(i => i < index);
    let rightTabs = this.tabs.filter(i => i > index);
    rightTabs.forEach(i => {
      const oldKey = "clipboard_data_" + i;
      const newKey = "clipboard_data_" + (i - 1);

      let tabContent = localStorage.getItem(oldKey);
      localStorage.removeItem(oldKey);
      localStorage.setItem(newKey, tabContent!);
      result.push(i - 1);
    })
    this.tabs = result;

    let isRightTab = index > (this.tabs.length - 1);
    this.fetchDataFromCache(isRightTab ? index - 1 : index);
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
    if (!ignoreSelection && this.selectedItemsCount) {
      return {
        notes: this.notes$.getValue()?.filter(x => x.selected),
        taskLists: this.taskLists$.getValue()?.filter(x => x.selected),
        images: this.images$.getValue()?.filter(x => x.selected),
      } as Tab
    }
    return {
      notes: this.notes$.getValue(),
      taskLists: this.taskLists$.getValue(),
      images: this.images$.getValue()
    } as Tab;
  }

  setFromJson(json: string) {
    let currentNotes: Note[] = this.notes$.getValue() ?? [];
    let currentTaskLists: TaskList[] = this.taskLists$.getValue() ?? [];
    let currentImages: Image[] = this.images$.getValue() ?? [];

    let uploadedData = JSON.parse(json) as Tab;
    let uploadedNotes = uploadedData.notes;
    let uploadedTaskLists = uploadedData.taskLists;
    let uploadedImages = uploadedData.images;

    uploadedNotes?.forEach((upload: Note) => {
      if (!currentNotes.some(curr => {
        return this.compareNote(upload, curr);
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
        return this.compareTaskList(upload, curr);
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
        return this.compareImage(upload, curr);
      })) {
        currentImages.push(upload);
        this.itemsCount++;
        if (upload.selected) {
          this.onSelectionChange(upload);
        }
      }
    });
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

  compareNote(left: Note, right: Note): boolean {
    return left.content === right.content
      && left.header === right.header
      && left.posX === right.posX
      && left.posY === right.posY
  }

  compareTaskList(left: TaskList, right: TaskList): boolean {
    return left.header === right.header
      && left.posX === right.posX
      && left.posY === right.posY
  }

  compareImage(left: Image, right: Image): boolean {
    return left.source === right.source
      && left.posX === right.posX
      && left.posY === right.posY
  }
}
