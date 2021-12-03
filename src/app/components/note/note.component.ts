import {Component, Input} from '@angular/core';
import {Note} from "../../models/note.model";

@Component({
  selector: 'note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.css']
})
export class NoteComponent {
  @Input()
  note: Note = {} as Note;
}
