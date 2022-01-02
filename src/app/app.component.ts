import {Component, ViewChild} from '@angular/core';
import {MatBottomSheet} from "@angular/material/bottom-sheet";
import {MatDialog} from "@angular/material/dialog";
import {MatMenuTrigger} from "@angular/material/menu";
import {Subscription} from "rxjs";
import {AboutDialogComponent} from "./components/dialogs/about-dialog/about-dialog.component";
import {DeleteDialogComponent} from "./components/dialogs/delete-dialog/delete-dialog.component";
import {EditNoteDialogComponent} from "./components/dialogs/edit-note-dialog/edit-note-dialog.component";
import {EditTabDialogComponent} from "./components/dialogs/edit-tab-dialog/edit-tab-dialog.component";
import {EditTaskListDialogComponent} from "./components/dialogs/edit-task-list-dialog/edit-task-list-dialog.component";
import {Note, TaskList} from './models';
import {DataService} from "./services/data.service";
import {HashyService} from "./services/hashy.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  dialogSubscription?: Subscription;
  @ViewChild(MatMenuTrigger)
  contextMenu!: MatMenuTrigger;
  rightClickPosX = 0;
  rightClickPosY = 0;
  newNotePositionX = 0;
  newNotePositionY = 0;

  constructor(
    private readonly dialog: MatDialog,
    private readonly bottomSheet: MatBottomSheet,
    public readonly dataService: DataService,
    public readonly hashy: HashyService
  ) {
  }

  save() {
    this.dataService.save();
  }

  saveAs() {
    this.dataService.saveAs();
  }

  clearSelection() {
    this.dataService.clearSelection();
  }

  deleteSelectedItems() {
    this.dataService.deleteSelectedItems();
  }

  openNewNoteDialog() {
    if (this.dialogSubscription) {
      this.dialogSubscription.unsubscribe();
    }

    let newNote = new Note(this.newNotePositionX, this.newNotePositionY, '');
    const dialogRef = this.dialog.open(EditNoteDialogComponent, {
      width: 'var(--width-edit-dialog)',
      data: newNote,
    });

    this.dialogSubscription = dialogRef.afterClosed().subscribe(() => {
      this.dataService.addNote(newNote);
    });
  }

  openNewTaskListDialog() {
    if (this.dialogSubscription) {
      this.dialogSubscription.unsubscribe();
    }

    let newTaskList = new TaskList(this.newNotePositionX, this.newNotePositionY);
    const dialogRef = this.dialog.open(EditTaskListDialogComponent, {
      width: 'var(--width-edit-dialog)',
      data: newTaskList,
    });

    this.dialogSubscription = dialogRef.afterClosed().subscribe(() => {
      this.dataService.addTaskList(newTaskList);
    });
  }

  openEditTabDialog() {
    if (this.dialogSubscription) {
      this.dialogSubscription.unsubscribe();
    }

    const dialogRef = this.dialog.open(EditTabDialogComponent, {
      width: 'var(--width-edit-dialog)',
      data: this.dataService.tabs[this.dataService.currentTabIndex],
    });

    this.dialogSubscription = dialogRef.afterClosed().subscribe(() => {
      this.dataService.cacheData();
    });
  }

  clearAll() {
    this.dataService.clearAllData();
    this.hashy.show('All notes deleted', 5000, 'Undo', () => {
      this.dataService.fetchDataFromCache();
    }, () => {
      this.dataService.cacheData();
    });
  }

  clearAllForever() {
    this.bottomSheet.open(DeleteDialogComponent);
  }

  showAboutDialog() {
    this.dialog.open(AboutDialogComponent);
  }

  showContextMenu(event: any, ignoreMousePosition?: boolean) {
    event.preventDefault();
    this.rightClickPosX = event.clientX;
    this.rightClickPosY = event.clientY;
    this.contextMenu.openMenu();

    this.newNotePositionX = ignoreMousePosition ? 10 : this.rightClickPosX;
    this.newNotePositionY = ignoreMousePosition ? 61 : this.rightClickPosY;
  }
}
