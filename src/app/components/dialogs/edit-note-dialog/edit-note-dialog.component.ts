import {ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Note} from "@clipboardjesus/models";

/**
 * Dialog component for the edit-dialog a note.
 */
@Component({
  selector: 'cb-edit-note-dialog',
  templateUrl: './edit-note-dialog.component.html',
  styleUrls: ['./edit-note-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditNoteDialogComponent {
  /**
   * Hack to not show the tooltip twice.
   */
  suppressTooltip = false;

  /**
   * Create an instance of the dialog.
   * @param dialogRef The reference to the material dialog.
   * @param data The note to edit.
   * @param cdr The reference to the ChangeDetector for updating the view.
   */
  constructor(
    protected readonly dialogRef: MatDialogRef<EditNoteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) protected data: Note,
    private readonly cdr: ChangeDetectorRef,
  ) {}

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
   * Toggle the reminder form fields.
   */
  toggleReminder(): void {
    this.suppressTooltip = true;
    setTimeout(() => {
      this.suppressTooltip = false;
      this.cdr.markForCheck();
    }, 100);
    this.data.reminder = !this.data.reminder ? {} : undefined;
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
