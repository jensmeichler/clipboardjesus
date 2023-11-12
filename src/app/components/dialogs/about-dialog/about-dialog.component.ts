import {ChangeDetectionStrategy, Component, HostListener} from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";
import {DataService, SettingsService} from "@clipboardjesus/services";

/**
 * The component of the about-dialog.
 */
@Component({
  selector: 'cb-about-dialog',
  templateUrl: './about-dialog.component.html',
  styleUrls: ['./about-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AboutDialogComponent {
  /**
   * Create an instance of the dialog.
   * @param dialogRef The reference to the material dialog.
   * @param dataService The reference to the data service.
   * @param settings The reference to the settings service.
   */
  constructor(
    protected readonly dialogRef: MatDialogRef<AboutDialogComponent>,
    protected readonly dataService: DataService,
    protected readonly settings: SettingsService
  ) {}

  /**
   * Close the dialog when the user pressed escape.
   */
  @HostListener('keydown', ['$event'])
  onKeyPressed(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.cancel();
    }
    event.stopPropagation();
  }

  /**
   * Close the dialog.
   */
  cancel(): void {
    this.dialogRef.close(false);
  }
}
