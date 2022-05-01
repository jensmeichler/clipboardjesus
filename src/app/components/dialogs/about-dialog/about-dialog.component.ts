import {Component, HostListener} from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-about-dialog',
  templateUrl: './about-dialog.component.html',
  styleUrls: ['./about-dialog.component.scss']
})
export class AboutDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<AboutDialogComponent>) {
  }

  @HostListener('keydown', ['$event'])
  onKeyPressed(event: KeyboardEvent) {
    if (event.key == 'Escape') {
      this.cancel();
    }

    event.stopPropagation();
  }

  cancel() {
    this.dialogRef.close();
  }
}
