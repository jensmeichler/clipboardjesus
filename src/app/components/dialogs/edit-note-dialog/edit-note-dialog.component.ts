import {ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Note} from "@clipboardjesus/models";

@Component({
  selector: 'cb-edit-note-dialog',
  templateUrl: './edit-note-dialog.component.html',
  styleUrls: ['./edit-note-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditNoteDialogComponent {
  suppressTooltip = false;

  constructor(
    public dialogRef: MatDialogRef<EditNoteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Note,
    private cdr: ChangeDetectorRef,
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

  toggleReminder(): void {
    this.suppressTooltip = true;
    setTimeout(() => {
      this.suppressTooltip = false;
      this.cdr.markForCheck();
    }, 100);
    this.data.reminder = !this.data.reminder
      ? { date: null, time: null }
      : undefined;
  }

  submit(): void {
    if (!this.data.header?.trim()) {
      this.data.header = undefined;
    }
    this.dialogRef.close(this.data);
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
