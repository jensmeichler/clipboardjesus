import {Component, HostListener} from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'cb-save-as-dialog',
  templateUrl: './save-as-dialog.component.html',
  styleUrls: ['./save-as-dialog.component.scss']
})
export class SaveAsDialogComponent {
  filename: string = '';

  constructor(private readonly dialogRef: MatDialogRef<SaveAsDialogComponent>) {
  }

  save(): void {
    this.dialogRef.close(this.filename);
  }

  cancel(): void {
    this.dialogRef.close();
  }

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
