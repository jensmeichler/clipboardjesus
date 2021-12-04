import {Injectable} from '@angular/core';
import {Note} from "../models/note.model";

@Injectable({
  providedIn: 'root'
})
export class NoteService {

  constructor() {
  }

  get(): Note[] {
    //TODO
    console.log('get from file not implemented')
    return [];
  }

  save(notes: Note[], fileName: string) {
    let content = JSON.stringify(notes);
    let a = document.createElement('a');
    let file = new Blob([content], {type: 'text/plain'});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
  }
}
