import {ChangeDetectionStrategy, Component, HostListener} from '@angular/core';
import {MatBottomSheetRef} from "@angular/material/bottom-sheet";
import {DataService} from "@clipboardjesus/services";

/**
 * Dialog component for the delete-dialog.
 */
@Component({
  selector: 'cb-delete-dialog',
  templateUrl: './delete-dialog.component.html',
  styleUrls: ['./delete-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeleteDialogComponent {
  /**
   * Create an instance of the dialog.
   * @param bottomSheetRef Reference to the material bottom sheet.
   * @param dataService Reference to the data service.
   */
  constructor(
    private readonly bottomSheetRef: MatBottomSheetRef<DeleteDialogComponent>,
    private readonly dataService: DataService,
  ) {}

  /**
   * Confirm the dialog.
   */
  deleteAll(): void {
    this.dataService.clearCache();
    this.bottomSheetRef.dismiss();
  }

  /**
   * Close the dialog.
   */
  cancel(): void {
    this.bottomSheetRef.dismiss();
  }

  /**
   * Confirm the dialog when the user pressed enter.
   * Close the dialog when the user pressed escape.
   */
  @HostListener('document:keydown', ['$event'])
  onKeyPressed(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.deleteAll();
    } else if (event.key === 'Escape') {
      this.cancel();
    }

    event.stopPropagation();
  }
}
