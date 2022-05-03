import {Component, Input} from '@angular/core';
import {NoteList} from "../../models";

@Component({
  selector: 'app-note-list',
  templateUrl: './note-list.component.html',
  styleUrls: ['./note-list.component.scss']
})
export class NoteListComponent {
  @Input() noteList?: NoteList;
}
