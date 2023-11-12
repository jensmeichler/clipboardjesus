import {ChangeDetectionStrategy, Component, HostListener, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Note, NoteList} from "@clipboardjesus/models";
import {MatChipInputEvent} from "@angular/material/chips";

/**
 * Dialog component for the edit-dialog of a note list.
 */
@Component({
  selector: 'cb-edit-note-list-dialog',
  templateUrl: './edit-note-list-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditNoteListDialogComponent {
  /**
   * Create an instance of the dialog.
   * @param dialogRef The reference to the material dialog.
   * @param data The note list to edit.
   */
  constructor(
    protected readonly dialogRef: MatDialogRef<EditNoteListDialogComponent>,
    @Inject(MAT_DIALOG_DATA) protected data: NoteList,
  ) {}

  /**
   * Add a note to the list, when user hits [Enter] into the input field.
   */
  addNote(event: MatChipInputEvent): void {
    const noteContent = (event.value || '').trim();

    if (noteContent) {
      const newNote = new Note(null, 0, 0, noteContent);
      this.data.notes.push(newNote);
    }

    event.chipInput!.clear();
  }

  /**
   * Remove the note from the note list.
   */
  removeNote(note: Note): void {
    const index = this.data.notes.indexOf(note);
    if (index >= 0) {
      this.data.notes.splice(index, 1);
    }
  }

  /**
   * Confirm the dialog when the user pressed enter.
   * Close the dialog when the user pressed escape.
   */
  @HostListener('keydown', ['$event'])
  onKeyPressed(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      this.submit();
    } else if (event.key === 'Escape') {
      this.cancel();
    }

    event.stopPropagation();
  }

  /**
   * Confirm the dialog.
   */
  submit(): void {
    if (!this.data.header?.trim()) {
      this.data.header = undefined;
    }
    this.dialogRef.close(this.data);
  }

  /**
   * Close the dialog.
   */
  cancel(): void {
    this.dialogRef.close(false);
  }
}
