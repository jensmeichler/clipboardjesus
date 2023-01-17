import {ChangeDetectionStrategy, Component, HostListener} from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";

/**
 * Dialog component for the save-as-dialog.
 */
@Component({
  selector: 'cb-save-as-dialog',
  templateUrl: './save-as-dialog.component.html',
  styleUrls: ['./save-as-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SaveAsDialogComponent {
  /** The filename binding. */
  filename: string = '';

  /**
   * Create an instance of the dialog.
   */
  constructor(
    /** The reference to the material dialog. */
    private readonly dialogRef: MatDialogRef<SaveAsDialogComponent>,
  ) {}

  /**
   * Confirm the dialog.
   */
  save(): void {
    this.dialogRef.close(this.filename);
  }

  /**
   * Close the dialog.
   */
  cancel(): void {
    this.dialogRef.close(false);
  }

  /**
   * Confirm the dialog when the user pressed enter.
   * Close the dialog when the user pressed escape.
   */
  @HostListener('keydown', ['$event'])
  onKeyPressed(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.save()
    } else if (event.key === 'Escape') {
      this.cancel();
    }

    event.stopPropagation();
  }
}
