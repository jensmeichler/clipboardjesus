import {Component, HostListener, Inject} from '@angular/core';
import {MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef} from "@angular/material/bottom-sheet";
import {Tab} from "@clipboardjesus/models";
import {DataService} from "@clipboardjesus/services";

@Component({
  selector: 'cb-import-dialog',
  templateUrl: './import-dialog.component.html',
  styleUrls: ['./import-dialog.component.scss']
})
export class ImportDialogComponent {
  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: string,
    private readonly bottomSheetRef: MatBottomSheetRef<ImportDialogComponent>,
    private readonly dataService: DataService) {
  }

  import(): void {
    this.dataService.clearCache();
    this.dataService.tabs = JSON.parse(this.data) as Tab[];
    this.dataService.selectedTabIndex = 0;
    this.dataService.cacheAllData();
    this.bottomSheetRef.dismiss();
  }

  cancel(): void {
    this.bottomSheetRef.dismiss();
  }

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
