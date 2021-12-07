import {Component, HostListener} from '@angular/core';
import {MatSnackBar} from "@angular/material/snack-bar";
import * as moment from 'moment';
import {BehaviorSubject} from 'rxjs';
import {Note} from './models/note.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  constructor(private readonly snackBar: MatSnackBar) {
  }

  notes$: BehaviorSubject<Note[] | null> = new BehaviorSubject<Note[] | null>(null);
  isDragging = false;

  newNote(event: MouseEvent) {
    let posX = event.pageX;
    let posY = event.pageY;
    this.addNote(new Note(posX, posY))
  }

  private addNote(note: Note) {
    let currentNotes = this.notes$.getValue() ?? [];
    currentNotes?.push(note);
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

  dropFile(event: any) {
    let posX = event.pageX;
    let posY = event.pageY;
    let data = event.dataTransfer.items[0];
    if (data.kind === 'file') {
      let file: Blob = data.getAsFile();
      let fileReader = new FileReader();
      fileReader.onload = () => {
        let fileName = (file as any).name as string;
        if (fileName.endsWith('notes.json')) {
          this.writeNotes(fileReader.result!.toString());
        } else {
          let fileType = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
          switch (fileType) {
            case 'txt':
            case 'json':
            case 'rtf':
              this.addNote(new Note(posX, posY, fileReader.result!.toString()));
              break;
            default:
              this.snackBar.open('Type ' + fileType.toUpperCase() + ' not supported',
                undefined, {duration: 4000});
              break;
          }
        }
      }
      fileReader.readAsText(file);
    } else if (data.kind === 'string') {
      data.getAsString((value: string) => {
        this.addNote(new Note(posX, posY, value));
        //TODO: BUG refresh not made
        //this.changeDetectorRef.detectChanges();
      })
    }
  }

  private writeNotes(json: string) {
    let currentNotes: Note[] = this.notes$.getValue() ?? [];
    let uploadedNotes: Note[] = JSON.parse(json);
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
    this.dropFile(event);
    this.onNotDragging(event)
    event.stopPropagation();
  }
}
