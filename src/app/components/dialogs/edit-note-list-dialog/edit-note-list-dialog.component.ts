import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {NoteList} from "../../../models";

@Component({
  selector: 'app-edit-note-list-dialog',
  templateUrl: './edit-note-list-dialog.component.html',
  styleUrls: ['./edit-note-list-dialog.component.scss']
})
export class EditNoteListDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<EditNoteListDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: NoteList,
  ) {
  }
}
