import {ChangeDetectionStrategy, Component, HostListener, Inject} from '@angular/core';
import {MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef} from "@angular/material/bottom-sheet";
import {Tab} from "@clipboardjesus/models";
import {DataService} from "@clipboardjesus/services";

/**
 * Dialog component for the import-dialog.
 */
@Component({
  selector: 'cb-import-dialog',
  templateUrl: './import-dialog.component.html',
  styleUrls: ['./import-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImportDialogComponent {
  /**
   * Create an instance of the dialog.
   * @param data The tab array as JSON.
   * @param bottomSheetRef Reference to the material bottom sheet.
   * @param dataService Reference to the data service.
   */
  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) protected data: string,
    private readonly bottomSheetRef: MatBottomSheetRef<ImportDialogComponent>,
    private readonly dataService: DataService,
  ) {}

  /**
   * Confirm the dialog.
   */
  import(): void {
    this.dataService.clearCache();
    this.dataService.tabs = JSON.parse(this.data) as Tab[];
    this.dataService.selectedTabIndex = 0;
    this.dataService.cacheAllData();
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
      this.import();
    } else if (event.key === 'Escape') {
      this.cancel();
    }

    event.stopPropagation();
  }
}
