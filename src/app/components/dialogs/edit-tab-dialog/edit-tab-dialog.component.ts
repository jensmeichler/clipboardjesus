import {Component, HostListener, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Tab} from "../../../models";
import {DataService} from "../../../services";

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
    this.notesCount = dataService.tab.notes?.length.toString() ?? '0';
    this.taskListsCount = dataService.tab.taskLists?.length.toString() ?? '0';
    this.imagesCount = dataService.tab.images?.length.toString() ?? '0';
  }

  deleteNotes() {
    this.notesCount = '0';
    this.dataService.tab.notes = []
  }

  deleteTaskLists() {
    this.taskListsCount = '0';
    this.dataService.tab.taskLists = []
  }

  deleteImages() {
    this.imagesCount = '0';
    this.dataService.tab.images = []
  }

  moveToRight() {
    this.reArrangeTab(this.dataService.selectedTabIndex + 1);
  }

  moveToLeft() {
    this.reArrangeTab(this.dataService.selectedTabIndex - 1);
  }

  @HostListener('keydown', ['$event'])
  onKeyPressed(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      this.submit();
    } else if (event.key === 'Escape') {
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
    const sourceIndex = this.dataService.selectedTabIndex;
    this.dataService.reArrangeTab(sourceIndex, targetIndex);
  }
}
