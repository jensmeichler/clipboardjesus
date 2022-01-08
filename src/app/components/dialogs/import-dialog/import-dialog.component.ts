import {Component, Inject} from '@angular/core';
import {MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef} from "@angular/material/bottom-sheet";
import {DataService} from "../../../services/data.service";
import {Tab} from "../../../models";

@Component({
  selector: 'app-import-dialog',
  templateUrl: './import-dialog.component.html',
  styleUrls: ['./import-dialog.component.css']
})
export class ImportDialogComponent {
  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: string,
    private readonly bottomSheetRef: MatBottomSheetRef<ImportDialogComponent>,
    private readonly dataService: DataService) {
  }

  import() {
    const tabs = JSON.parse(this.data) as Tab[];
    this.dataService.setFromTabsJson(tabs);
    this.bottomSheetRef.dismiss();
  }

  cancel() {
    this.bottomSheetRef.dismiss();
  }
}
