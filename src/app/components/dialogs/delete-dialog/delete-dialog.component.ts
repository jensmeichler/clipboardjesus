import {Component, HostListener} from '@angular/core';
import {MatBottomSheetRef} from "@angular/material/bottom-sheet";
import {DataService} from "../../../services";

@Component({
  selector: 'app-delete-dialog',
  templateUrl: './delete-dialog.component.html',
  styleUrls: ['./delete-dialog.component.scss']
})
export class DeleteDialogComponent {
  constructor(
    private readonly bottomSheetRef: MatBottomSheetRef<DeleteDialogComponent>,
    private readonly dataService: DataService) {
  }

  deleteAll(): void {
    this.dataService.clearCache();
    this.bottomSheetRef.dismiss();
  }

  cancel(): void {
    this.bottomSheetRef.dismiss();
  }

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
