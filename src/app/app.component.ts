import {Component} from '@angular/core';
import {Note} from './models/note.model';
import {BehaviorSubject} from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  notes$: BehaviorSubject<Note[] | null> = new BehaviorSubject<Note[] | null>(null);

  newNote() {
    let currentNotes = this.notes$.getValue() ?? [];
    currentNotes?.push(new Note());
    this.notes$.next(currentNotes);
  }
}
