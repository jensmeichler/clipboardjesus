import {Component, HostListener, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Tab} from "../../../models";
import {DataService} from "../../../services/data.service";

@Component({
  selector: 'app-edit-tab-dialog',
  templateUrl: './edit-tab-dialog.component.html'
})
export class EditTabDialogComponent {
  notesCount: string;
  taskListsCount: string;
  imagesCount: string;
  purple = '#7b1ea2';
  green = '#69f0ae';
  reset = '#131313';

  constructor(
    public dialogRef: MatDialogRef<EditTabDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Tab,
    public readonly dataService: DataService
  ) {
    this.notesCount = dataService.notes$.getValue()?.length?.toString() ?? '0';
    this.taskListsCount = dataService.taskLists$.getValue()?.length?.toString() ?? '0';
    this.imagesCount = dataService.images$.getValue()?.length?.toString() ?? '0';
  }

  deleteNotes() {
    this.dataService.notes$.next([]);
  }

  deleteTaskLists() {
    this.dataService.taskLists$.next([]);
  }

  deleteImages() {
    this.dataService.images$.next([]);
  }

  moveToRight() {
    this.reArrangeTab(this.dataService.currentTabIndex + 1);
  }

  moveToLeft() {
    this.reArrangeTab(this.dataService.currentTabIndex - 1);
  }

  @HostListener('keydown', ['$event'])
  onKeyPressed(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key == 'Enter') {
      this.submit();
    } else if (event.key == 'Escape') {
      this.cancel();
    }

    event.stopPropagation();
  }

  submit() {
    this.dialogRef.close(this.data);
  }

  cancel() {
    this.dialogRef.close();
  }

  private reArrangeTab(targetIndex: number) {
    const sourceIndex = this.dataService.currentTabIndex;
    this.dataService.reArrangeTab(sourceIndex, targetIndex);
    this.dataService.setSelectedTab(sourceIndex);
    this.dataService.setSelectedTab(targetIndex);
  }
}
