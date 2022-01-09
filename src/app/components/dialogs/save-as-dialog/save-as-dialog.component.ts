import {Component, HostListener} from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'save-as-dialog',
  templateUrl: './save-as-dialog.component.html'
})
export class SaveAsDialogComponent {
  filename: string = '';

  constructor(private readonly dialogRef: MatDialogRef<SaveAsDialogComponent>) {
  }

  submit() {
    this.dialogRef.close(this.filename);
  }

  @HostListener('keydown', ['$event'])
  onKeyPressed(event: KeyboardEvent) {
    event.stopPropagation();
  }
}
