import {Component, HostListener} from '@angular/core';
import {Note} from './models/note.model';
import {BehaviorSubject} from 'rxjs';

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
    a.download = 'Notes.json';
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

  @HostListener("dragover", ["$event"]) onDragOver(event: any) {
    this.dragMove(event, true);
  }

  @HostListener("dragenter", ["$event"]) onDragEnter(event: any) {
    this.dragMove(event, true);
  }

  @HostListener("dragend", ["$event"]) onDragEnd(event: any) {
    this.dragMove(event, false);
  }

  @HostListener("dragleave", ["$event"]) onDragLeave(event: any) {
    this.dragMove(event, false);
  }

  @HostListener("drop", ["$event"]) onDrop(event: any) {
    this.getNotes(event);
    this.dragMove(event, false);
    event.stopPropagation();
  }

  private dragMove(event: any, drag: boolean) {
    this.isDragging = drag;
    event.preventDefault();
  }
}
