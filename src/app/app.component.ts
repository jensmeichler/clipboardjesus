import {Component} from '@angular/core';
import {Note} from './models/note.model';
import {BehaviorSubject} from 'rxjs';
import {NoteService} from "./services/note.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  constructor(private readonly noteService: NoteService) {
  }

  notes$: BehaviorSubject<Note[] | null> = new BehaviorSubject<Note[] | null>(null);

  newNote(event: MouseEvent) {
    let currentNotes = this.notes$.getValue() ?? [];
    let posX = event.pageX;
    let posY = event.pageY;
    currentNotes?.push(new Note(posX, posY));
    this.notes$.next(currentNotes);
  }

  saveNotes() {
    this.noteService.save(this.notes$.getValue()!, 'Notes.json')
  }

  getNotes(any: any) {
    console.log(any)
    this.notes$.next(this.noteService.get())
  }
}
