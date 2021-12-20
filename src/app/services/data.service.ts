import {Injectable} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {Image, Note, TaskList, NotesJson} from "../models";
import * as moment from "moment";

@Injectable({
  providedIn: 'root'
})
export class DataService {
  notes$: BehaviorSubject<Note[] | null> = new BehaviorSubject<Note[] | null>(null);
  taskLists$: BehaviorSubject<TaskList[] | null> = new BehaviorSubject<TaskList[] | null>(null);
  images$: BehaviorSubject<Image[] | null> = new BehaviorSubject<Image[] | null>(null);

  itemsCount = 0;
  selectedItemsCount = 0;

  private selectedNotes: Note[] = [];
  private selectedTaskLists: TaskList[] = [];

  selectNote(note: Note, selected: boolean) {
    if (selected) {
      this.selectedNotes.push(note);
      this.selectedItemsCount++;
    } else {
      if (this.selectedNotes.some(x => x === note)) {
        this.selectedNotes = this.selectedNotes!.filter(x => x !== note);
        this.selectedItemsCount--;
      }
    }
  }

  selectTaskList(taskList: TaskList, selected: boolean) {
    if (selected) {
      this.selectedTaskLists.push(taskList);
      this.selectedItemsCount++;
    } else {
      if (this.selectedTaskLists.some(x => x === taskList)) {
        this.selectedTaskLists = this.selectedTaskLists!.filter(x => x !== taskList);
        this.selectedItemsCount--;
      }
    }
  }

  addNote(note: Note) {
    if (!note.posZ) {
      note.posZ = this.getHighestIndex();
    }
    let currentNotes = this.notes$.getValue() ?? [];
    currentNotes?.push(note);
    this.notes$.next(currentNotes);
    this.itemsCount++;
  }

  addTaskList(taskList: TaskList) {
    if (!taskList.posZ) {
      taskList.posZ = this.getHighestIndex();
    }
    let currentTasks = this.taskLists$.getValue() ?? [];
    currentTasks?.push(taskList);
    this.taskLists$.next(currentTasks);
    this.itemsCount++;
  }

  addImage(image: Image) {
    let currentImages = this.images$.getValue() ?? [];
    currentImages?.push(image);
    this.images$.next(currentImages);
    this.itemsCount++;
  }

  deleteNote(note: Note) {
    this.selectNote(note, false);
    this.itemsCount--;

    let notes = this.notes$.getValue();
    let filteredNotes = notes!.filter(x => x !== note);
    this.notes$.next(filteredNotes!);
  }

  deleteTaskList(taskList: TaskList) {
    this.selectTaskList(taskList, false);
    this.itemsCount--;

    let taskLists = this.taskLists$.getValue();
    let filteredTaskLists = taskLists!.filter(x => x !== taskList);
    this.taskLists$.next(filteredTaskLists!);
  }

  deleteImage(image: Image) {
    let images = this.images$.getValue();
    let filteredImages = images!.filter(x => x !== image);
    this.images$.next(filteredImages!);
    this.itemsCount--;
  }

  getAsJson(): NotesJson {
    if (this.selectedItemsCount) {
      return {
        notes: this.selectedNotes,
        taskLists: this.selectedTaskLists
      } as NotesJson
    }
    return {
      notes: this.notes$.getValue(),
      taskLists: this.taskLists$.getValue(),
      images: this.images$.getValue()
    } as NotesJson;
  }

  setFromJson(json: string) {
    let currentNotes: Note[] = this.notes$.getValue() ?? [];
    let currentTaskLists: TaskList[] = this.taskLists$.getValue() ?? [];
    let currentImages: Image[] = this.images$.getValue() ?? [];

    let uploadedData = JSON.parse(json) as NotesJson;
    let uploadedNotes = uploadedData.notes;
    let uploadedTaskLists = uploadedData.taskLists;
    let uploadedImages = uploadedData.images;

    uploadedNotes?.forEach((upload: Note) => {
      if (!currentNotes.some(curr => {
        return upload.content === curr.content
          && upload.header === curr.header
          && upload.posX === curr.posX
          && upload.posY === curr.posY
      })) {
        currentNotes.push(upload);
        this.itemsCount++;
      }
    });
    uploadedTaskLists?.forEach((upload: TaskList) => {
      if (!currentTaskLists.some(curr => {
        return upload.header === curr.header
          && upload.posX === curr.posX
          && upload.posY === curr.posY
      })) {
        currentTaskLists.push(upload);
        this.itemsCount++;
      }
    });
    uploadedImages?.forEach((upload: Image) => {
      if (!currentImages.some(curr => {
        return upload.source === curr.source
          && upload.posX === curr.posX
          && upload.posY === curr.posY
      })) {
        currentImages.push(upload);
        this.itemsCount++;
      }
    });
    this.notes$.next(currentNotes);
    this.taskLists$.next(currentTaskLists);
    this.images$.next(currentImages);
  }

  save(): string {
    let json = this.getAsJson();
    let filename = moment(new Date()).format('YYYY-MM-DD-HH-mm') + '.notes.json';
    let a = document.createElement('a');
    let file = new Blob([JSON.stringify(json)], {type: 'text/plain'});
    a.href = URL.createObjectURL(file);
    a.download = filename;
    a.click();
    return filename;
  }

  private getHighestIndex(): number | undefined {
    let highestNote = this.notes$.getValue()
      ?.filter(n => n.posZ)
      ?.reduce((hn, n) => Math.max(hn, n.posZ!), 0);
    let highestTaskList = this.taskLists$.getValue()
      ?.filter(t => t.posZ)
      ?.reduce((ht, t) => Math.max(ht, t.posZ!), 0);

    if (highestNote && highestTaskList) {
      return highestNote > highestTaskList
        ? highestNote + 1
        : highestTaskList + 1;
    } else if (highestNote || highestTaskList) {
      return highestNote
        ? highestNote + 1
        : highestTaskList! + 1;
    } else {
      return undefined;
    }
  }
}
