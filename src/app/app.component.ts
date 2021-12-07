import {Component, HostListener} from '@angular/core';
import * as moment from 'moment';
import {BehaviorSubject} from 'rxjs';
import {Note} from './models/note.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  notes$: BehaviorSubject<Note[] | null> = new BehaviorSubject<Note[] | null>(null);
  isDragging = false;

  newNote(event: MouseEvent) {
    let currentNotes = this.notes$.getValue() ?? [];
    let posX = event.pageX;
    let posY = event.pageY;
    currentNotes?.push(new Note(posX, posY));
    this.notes$.next(currentNotes);
  }

  saveNotes() {
    let content = JSON.stringify(this.notes$.getValue());
    let a = document.createElement('a');
    let file = new Blob([content], {type: 'text/plain'});
    a.href = URL.createObjectURL(file);
    a.download = moment(new Date()).format('YYYY-MM-DD-HH-mm') + '.notes.json';
    a.click();
  }

  getNotes(event: any) {
    if (event.dataTransfer.items[0].kind === 'file') {
      let file: Blob = event.dataTransfer.items[0].getAsFile();
      let fileReader = new FileReader();
      fileReader.onload = () => {
        let currentNotes: Note[] = this.notes$.getValue() ?? [];
        let uploadedNotes: Note[] = JSON.parse(fileReader.result!.toString());
        uploadedNotes.forEach((upload: Note) => {
          if (!currentNotes.some(curr => {
            return upload.content === curr.content
              && upload.header === curr.header
              && upload.posX === curr.posX
              && upload.posY === curr.posY
          })) {
            currentNotes.push(upload);
          }
        })
        this.notes$.next(currentNotes);
      }
      fileReader.readAsText(file);
    }
  }

  @HostListener("dragover", ["$event"])
  @HostListener("dragenter", ["$event"])
  onDragging(event: any) {
    this.isDragging = true;
    event.preventDefault();
  }

  @HostListener("dragend", ["$event"])
  @HostListener("dragleave", ["$event"])
  onNotDragging(event: any) {
    this.isDragging = false;
    event.preventDefault();
  }

  @HostListener("drop", ["$event"])
  onDrop(event: any) {
    this.getNotes(event);
    this.onNotDragging(event)
    event.stopPropagation();
  }
}
