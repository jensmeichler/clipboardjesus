import {Component, HostListener, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Note} from "../../../models";

@Component({
  selector: 'cb-edit-note-dialog',
  templateUrl: './edit-note-dialog.component.html'
})
export class EditNoteDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<EditNoteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Note,
  ) {
  }

  @HostListener('keydown', ['$event'])
  onKeyPressed(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      this.submit();
    } else if (event.key === 'Escape') {
      this.cancel();
    }

    event.stopPropagation();
  }

  submit(): void {
    this.dialogRef.close(this.data);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
