import {Component, HostListener} from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'save-as-dialog',
  templateUrl: './save-as-dialog.component.html',
  styleUrls: ['./save-as-dialog.component.scss']
})
export class SaveAsDialogComponent {
  filename: string = '';

  constructor(private readonly dialogRef: MatDialogRef<SaveAsDialogComponent>) {
  }

  save() {
    this.dialogRef.close(this.filename);
  }

  cancel() {
    this.dialogRef.close();
  }

  @HostListener('keydown', ['$event'])
  onKeyPressed(event: KeyboardEvent) {
    if (event.key == 'Enter') {
      this.save()
    } else if (event.key == 'Escape') {
      this.cancel();
    }

    event.stopPropagation();
  }
}
