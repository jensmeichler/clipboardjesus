import {Component, HostListener} from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";
import {DataService} from "../../../services";

@Component({
  selector: 'cb-about-dialog',
  templateUrl: './about-dialog.component.html',
  styleUrls: ['./about-dialog.component.scss']
})
export class AboutDialogComponent {
  isWindows: boolean;
  isMacos: boolean;

  constructor(
    public dialogRef: MatDialogRef<AboutDialogComponent>,
    public dataService: DataService
  ) {
    this.isWindows = navigator.platform.indexOf('Win') > -1;
    this.isMacos = navigator.platform.indexOf('Mac') > -1;
  }

  @HostListener('keydown', ['$event'])
  onKeyPressed(event: KeyboardEvent): void {
    if (event.key === 'Escape') this.cancel();
    event.stopPropagation();
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
