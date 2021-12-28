import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
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

  deletedItemsCount = 0;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Tab,
    public readonly dataService: DataService
  ) {
    this.notesCount = dataService.notes$.getValue()?.length?.toString() ?? '0';
    this.taskListsCount = dataService.taskLists$.getValue()?.length?.toString() ?? '0';
    this.imagesCount = dataService.images$.getValue()?.length?.toString() ?? '0';
  }

  deleteNotes() {
    this.deletedItemsCount += this.dataService.notes$.getValue()?.length ?? 0;
    this.dataService.notes$.next([]);
    this.notesCount = '0';
  }

  deleteTaskLists() {
    this.deletedItemsCount += this.dataService.taskLists$.getValue()?.length ?? 0;
    this.dataService.taskLists$.next([]);
    this.taskListsCount = '0';
  }

  deleteImages() {
    this.deletedItemsCount += this.dataService.images$.getValue()?.length ?? 0;
    this.dataService.images$.next([]);
    this.imagesCount = '0';
  }
}
