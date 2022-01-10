import {Component, HostListener, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import {Note} from "../../../models";

@Component({
  selector: 'app-edit-note-dialog',
  templateUrl: './edit-note-dialog.component.html'
})
export class EditNoteDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Note,
  ) {
  }

  @HostListener('keydown', ['$event'])
  onKeyPressed(event: KeyboardEvent) {
    event.stopPropagation();
  }
}
