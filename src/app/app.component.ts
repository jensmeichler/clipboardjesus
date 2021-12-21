import {Component, ViewChild} from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {MatMenuTrigger} from "@angular/material/menu";
import {Subscription} from "rxjs";
import {EditNoteDialogComponent} from "./components/dialogs/edit-note-dialog/edit-note-dialog.component";
import {EditTaskListDialogComponent} from "./components/dialogs/edit-task-list-dialog/edit-task-list-dialog.component";
import {Image, Note, TaskList} from './models';
import {HashyService} from "./services/hashy.service";
import {DataService} from "./services/data.service";
import {AboutDialogComponent} from "./components/dialogs/about-dialog/about-dialog.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  constructor(
    private readonly dialog: MatDialog,
    public readonly dataService: DataService,
    public readonly hashy: HashyService,
  ) {
  }

  newNote(event: MouseEvent) {
    this.dataService.addNote(new Note(event.pageX, event.pageY))
  }

  save() {
    let filename = this.dataService.save();
    this.hashy.show('Saved as ' + filename, 3000, true);
  }

  dropFile(event: any) {
    let posX = event.pageX;
    let posY = event.pageY;
    let data = event.dataTransfer.items[0] as DataTransferItem;
    if (data.kind === 'file') {
      let file = data.getAsFile()!;
      if (file.name.endsWith('notes.json')) {
        file.text().then(text => {
          this.dataService.setFromJson(text);
        })
      } else if (file.type.startsWith('text') || file.type.startsWith('application')) {
        file.text().then(text => {
          this.dataService.addNote(new Note(posX, posY, text, file.name));
        })
      } else {
        this.hashy.show('Type ' + file.type.toUpperCase() + ' is not supported', 4000, true);
      }
    } else if (data.kind === 'string') {
      let draggedUrl = event.dataTransfer.getData('text/uri-list');
      if (draggedUrl) {
        let newImage = new Image(posX, posY, draggedUrl);
        this.dataService.addImage(newImage);
      } else {
        let draggedText = event.dataTransfer.getData('text');
        this.dataService.addNote(new Note(posX, posY, draggedText));
      }
    }
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

  saveItemPosition(event: any, item: { posX: number, posY: number }) {
    event.source._dragRef.reset();
    item.posX += event.distance.x;
    item.posY += event.distance.y;
    if (item.posX < 0) {
      item.posX = 0;
    }
    if (item.posY < 0) {
      item.posY = 0;
    }
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
