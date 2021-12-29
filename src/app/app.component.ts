import {Component, ViewChild} from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {MatMenuTrigger} from "@angular/material/menu";
import {Subscription} from "rxjs";
import {AboutDialogComponent} from "./components/dialogs/about-dialog/about-dialog.component";
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
  constructor(
    private readonly dialog: MatDialog,
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

  dialogSubscription?: Subscription;

  openNewNoteDialog() {
    if (this.dialogSubscription) {
      this.dialogSubscription.unsubscribe();
    }

    let newNote = new Note(this.rightClickPosX, this.rightClickPosY, '');
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

    let newTaskList = new TaskList(this.rightClickPosX, this.rightClickPosY);
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
    this.dataService.clearCache();
  }

  showAboutDialog() {
    this.dialog.open(AboutDialogComponent);
  }

  @ViewChild(MatMenuTrigger)
  contextMenu!: MatMenuTrigger;
  rightClickPosX = 0;
  rightClickPosY = 0;

  onRightClick(event: any) {
    event.preventDefault();
    this.rightClickPosX = event.clientX;
    this.rightClickPosY = event.clientY;
    this.contextMenu.openMenu();
  }
}
