import {ChangeDetectionStrategy, Component, HostListener} from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";
import {DataService, SettingsService} from "@clipboardjesus/services";

@Component({
  selector: 'cb-about-dialog',
  templateUrl: './about-dialog.component.html',
  styleUrls: ['./about-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AboutDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<AboutDialogComponent>,
    public dataService: DataService,
    public settings: SettingsService
  ) {
  }

  @HostListener('keydown', ['$event'])
  onKeyPressed(event: KeyboardEvent): void {
    if (event.key === 'Escape') this.cancel();
    event.stopPropagation();
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
