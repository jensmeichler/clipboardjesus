import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import {Tab} from "../../../models";
import {DataService} from "../../../services/data.service";
import {HashyService} from "../../../services/hashy.service";

@Component({
  selector: 'app-edit-tab-dialog',
  templateUrl: './edit-tab-dialog.component.html'
})
export class EditTabDialogComponent {
  notesCount: string;
  taskListsCount: string;
  imagesCount: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Tab,
    public readonly dataService: DataService,
    private readonly hashy: HashyService
  ) {
    this.notesCount = dataService.notes$.getValue()?.length?.toString() ?? '0';
    this.taskListsCount = dataService.taskLists$.getValue()?.length?.toString() ?? '0';
    this.imagesCount = dataService.images$.getValue()?.length?.toString() ?? '0';
  }

  deleteNotes() {
    this.dataService.notes$.next([]);
    const oldNotesCount = this.notesCount;
    this.notesCount = '0';
    this.hashy.show('All notes deleted', 5000, 'Undo', () => {
      this.dataService.fetchDataFromCache();
    }, () => {
      this.dataService.cacheData();
      this.notesCount = oldNotesCount;
    });
  }

  deleteTaskLists() {
    this.dataService.taskLists$.next([]);
    const oldTaskListsCount = this.taskListsCount;
    this.taskListsCount = '0';
    this.hashy.show('All taskLists deleted', 5000, 'Undo', () => {
      this.dataService.fetchDataFromCache();
    }, () => {
      this.dataService.cacheData();
      this.taskListsCount = oldTaskListsCount;
    });
  }

  deleteImages() {
    this.dataService.images$.next([]);
    const oldImagesCount = this.imagesCount;
    this.imagesCount = '0';
    this.hashy.show('All images deleted', 5000, 'Undo', () => {
      this.dataService.fetchDataFromCache();
    }, () => {
      this.dataService.cacheData();
      this.imagesCount = oldImagesCount;
    });
  }

  moveToRight() {
    this.reArrangeTab(this.dataService.currentTabIndex + 1);
  }

  moveToLeft() {
    this.reArrangeTab(this.dataService.currentTabIndex - 1);
  }

  private reArrangeTab(targetIndex: number) {
    const sourceIndex = this.dataService.currentTabIndex;
    this.dataService.reArrangeTab(sourceIndex, targetIndex);
    this.dataService.setSelectedTab(sourceIndex);
    this.dataService.setSelectedTab(targetIndex);
  }
}
