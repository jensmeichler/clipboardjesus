import {Component, HostListener, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Note} from "../../../models";

@Component({
  selector: 'app-edit-note-dialog',
  templateUrl: './edit-note-dialog.component.html'
})
export class EditNoteDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<EditNoteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Note,
  ) {
  }

  @HostListener('keydown', ['$event'])
  onKeyPressed(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      this.submit();
    } else if (event.key === 'Escape') {
      this.cancel();
    }

    event.stopPropagation();
  }

  submit() {
    this.dialogRef.close(this.data);
  }

  cancel() {
    this.dialogRef.close();
  }
}
