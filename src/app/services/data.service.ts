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

  addNote(note: Note) {
    let currentNotes = this.notes$.getValue() ?? [];
    currentNotes?.push(note);
    this.notes$.next(currentNotes);
  }

  addTaskList(taskList: TaskList) {
    let currentTasks = this.taskLists$.getValue() ?? [];
    currentTasks?.push(taskList);
    this.taskLists$.next(currentTasks);
  }

  addImage(image: Image) {
    let currentImages = this.images$.getValue() ?? [];
    currentImages?.push(image);
    this.images$.next(currentImages);
  }

  getAsJson(): NotesJson {
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
      }
    });
    uploadedTaskLists?.forEach((upload: TaskList) => {
      if (!currentTaskLists.some(curr => {
        return upload.header === curr.header
          && upload.posX === curr.posX
          && upload.posY === curr.posY
      })) {
        currentTaskLists.push(upload);
      }
    });
    uploadedImages?.forEach((upload: Image) => {
      if (!currentImages.some(curr => {
        return upload.source === curr.source
          && upload.posX === curr.posX
          && upload.posY === curr.posY
      })) {
        currentImages.push(upload);
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
}
