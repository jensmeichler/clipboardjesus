import {Component, HostListener, ViewChild} from '@angular/core';
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

  @HostListener('document:keydown', ['$event'])
  onKeyPressed(event: KeyboardEvent) {
    if (this.dataService.selectedItemsCount) {
      switch (event.key) {
        case 'Delete':
          this.deleteSelectedItems();
          return;
        case 'ArrowUp':
          this.dataService.editAllSelectedItems(x => x.posY--);
          break;
        case 'ArrowDown':
          this.dataService.editAllSelectedItems(x => x.posY++);
          break;
        case 'ArrowLeft':
          this.dataService.editAllSelectedItems(x => x.posX--);
          break;
        case 'ArrowRight':
          this.dataService.editAllSelectedItems(x => x.posX++);
          break;
        case 'Escape':
          this.dataService.removeAllSelections();
          break;
        case 'a':
          if (event.ctrlKey) {
            this.dataService.selectAll();
            event.preventDefault();
          }
          break;
        default:
          return;
      }
      this.dataService.cacheData();
    }
  }

  save() {
    this.dataService.saveAll();
  }

  saveAs() {
    this.dataService.saveAllAs();
  }

  saveTabOrSelection() {
    this.dataService.saveTabOrSelection();
  }

  deleteSelectedItems() {
    this.dataService.deleteSelectedItems();
  }

  openNewNoteDialog() {
    if (this.dialogSubscription) {
      this.dialogSubscription.unsubscribe();
    }

    const dialogRef = this.dialog.open(EditNoteDialogComponent, {
      width: 'var(--width-edit-dialog)',
      data: new Note(this.newNotePositionX, this.newNotePositionY, ''),
    });

    this.dialogSubscription = dialogRef.afterClosed().subscribe((note) => {
      if (note) {
        this.dataService.addNote(note);
      }
    });
  }

  openNewTaskListDialog() {
    if (this.dialogSubscription) {
      this.dialogSubscription.unsubscribe();
    }

    const dialogRef = this.dialog.open(EditTaskListDialogComponent, {
      width: 'var(--width-edit-dialog)',
      data: new TaskList(this.newNotePositionX, this.newNotePositionY),
    });

    this.dialogSubscription = dialogRef.afterClosed().subscribe((taskList) => {
      if (taskList) {
        this.dataService.addTaskList(taskList);
      }
    });
  }

  openEditTabDialog() {
    if (this.dialogSubscription) {
      this.dialogSubscription.unsubscribe();
    }

    const dialogRef = this.dialog.open(EditTabDialogComponent, {
      width: 'var(--width-edit-dialog)',
      data: this.dataService.tabs[this.dataService.currentTabIndex],
      disableClose: true,
    });

    this.dialogSubscription = dialogRef.afterClosed().subscribe((tab) => {
      if (tab) {
        this.dataService.cacheData();
      } else {
        this.dataService.fetchDataFromCache();
      }
    });
  }

  clearAll() {
    this.dataService.clearAllData();
    this.hashy.show('All notes deleted', 5000, 'Undo', () => {
      this.dataService.fetchDataFromCache();
    }, () => {
      this.dataService.cacheData();
      this.dataService.removeAllSelections();
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
