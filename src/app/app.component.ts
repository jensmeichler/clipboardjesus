import {Component, HostListener, ViewChild} from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {MatMenuTrigger} from "@angular/material/menu";
import {MatSnackBar} from "@angular/material/snack-bar";
import * as moment from 'moment';
import {BehaviorSubject, Subscription} from 'rxjs';
import {EditNoteDialogComponent} from "./components/dialogs/edit-note-dialog/edit-note-dialog.component";
import {EditTaskListDialogComponent} from "./components/dialogs/edit-task-list-dialog/edit-task-list-dialog.component";
import {Image, Note, TaskList} from './models';
import {DataService} from "./services/data.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {

  notes$: BehaviorSubject<Note[] | null>;
  taskLists$: BehaviorSubject<TaskList[] | null>;
  images$: BehaviorSubject<Image[] | null>;

  isDragging = false;

  constructor(
    private readonly snackBar: MatSnackBar,
    private readonly dialog: MatDialog,
    private readonly dataService: DataService
  ) {
    this.notes$ = dataService.notes$;
    this.taskLists$ = dataService.taskLists$;
    this.images$ = dataService.images$;
  }

  newNote(event: MouseEvent) {
    let posX = event.pageX;
    let posY = event.pageY;
    this.dataService.addNote(new Note(posX, posY))
  }

  save() {
    let json = this.dataService.getAsJson();
    let a = document.createElement('a');
    let file = new Blob([JSON.stringify(json)], {type: 'text/plain'});
    a.href = URL.createObjectURL(file);
    a.download = moment(new Date()).format('YYYY-MM-DD-HH-mm') + '.notes.json';
    a.click();
  }

  dropFile(event: any) {
    let posX = event.pageX;
    let posY = event.pageY;
    let data = event.dataTransfer.items[0] as DataTransferItem;
    if (data.kind === 'file') {
      let file = data.getAsFile()!;
      if (file.name.endsWith('notes.json')) {
        file.text().then(text => {
          this.dataService.writeNotes(text);
        })
      } else if (file.type.startsWith('text') || file.type.startsWith('application')) {
        file.text().then(text => {
          this.dataService.addNote(new Note(posX, posY, text, file.name));
        })
      } else {
        this.snackBar.open('Type ' + file.type.toUpperCase() + ' not supported',
          undefined, {duration: 4000});
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

  @HostListener("dragover", ["$event"])
  @HostListener("dragenter", ["$event"])
  onDragging(event: any) {
    this.isDragging = true;
    event.preventDefault();
  }

  @HostListener("dragend", ["$event"])
  @HostListener("dragleave", ["$event"])
  onNotDragging(event: any) {
    this.isDragging = false;
    event.preventDefault();
  }

  @HostListener("drop", ["$event"])
  onDrop(event: any) {
    this.dropFile(event);
    this.onNotDragging(event)
    event.stopPropagation();
  }
}
