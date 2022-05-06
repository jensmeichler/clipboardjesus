import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Note, NoteList} from "../../../models";
import {MatChipInputEvent} from "@angular/material/chips";

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

  addNote(event: MatChipInputEvent): void {
    const noteContent = (event.value || '').trim();

    if (noteContent) {
      let newNote = new Note(0, 0, noteContent);
      this.data.notes.push(newNote);
    }

    event.chipInput!.clear();
  }

  removeNote(note: Note): void {
    const index = this.data.notes.indexOf(note);
    if (index >= 0) {
      this.data.notes.splice(index, 1);
    }
  }

  submit() {
    this.dialogRef.close(this.data);
  }

  cancel() {
    this.dialogRef.close();
  }
}
