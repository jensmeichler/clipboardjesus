import {Component, HostListener} from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";
import {DataService} from "../../../services";

@Component({
  selector: 'cb-about-dialog',
  templateUrl: './about-dialog.component.html',
  styleUrls: ['./about-dialog.component.scss']
})
export class AboutDialogComponent {
  isBeta: boolean;

  constructor(
    public dialogRef: MatDialogRef<AboutDialogComponent>,
    dataService: DataService
  ) {
    this.isBeta = dataService.isBeta;
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
