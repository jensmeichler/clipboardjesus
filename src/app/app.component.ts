import {Component, HostListener, ViewChild} from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {MatMenuTrigger} from "@angular/material/menu";
import {MatSnackBar} from "@angular/material/snack-bar";
import * as moment from 'moment';
import {BehaviorSubject, Subscription} from 'rxjs';
import {EditNoteDialogComponent} from "./components/dialogs/edit-note-dialog/edit-note-dialog.component";
import {EditTaskListDialogComponent} from "./components/dialogs/edit-task-list-dialog/edit-task-list-dialog.component";
import {Note, TaskList} from './models';
import {NotesJson} from "./models/notes-json.model";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  constructor(
    private readonly snackBar: MatSnackBar,
    private readonly dialog: MatDialog
  ) {
  }

  notes$: BehaviorSubject<Note[] | null> = new BehaviorSubject<Note[] | null>(null);
  taskLists$: BehaviorSubject<TaskList[] | null> = new BehaviorSubject<TaskList[] | null>(null);

  isDragging = false;

  newNote(event: MouseEvent) {
    let posX = event.pageX;
    let posY = event.pageY;
    this.addNote(new Note(posX, posY))
  }

  private addNote(note: Note) {
    let currentNotes = this.notes$.getValue() ?? [];
    currentNotes?.push(note);
    this.notes$.next(currentNotes);
  }

  save() {
    let json = {
      notes: this.notes$.getValue(),
      taskLists: this.taskLists$.getValue()
    } as NotesJson;

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
      let fileReader = new FileReader();
      fileReader.onload = () => {
        let fileName = file.name as string;
        if (fileName.endsWith('notes.json')) {
          this.writeNotes(fileReader.result!.toString());
        } else {
          let fileType = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
          switch (fileType) {
            case 'txt':
            case 'json':
            case 'rtf':
            case 'md':
            case 'html':
            case 'css':
            case 'scss':
            case 'ts':
            case 'js':
            case 'cs':
            case 'cshtml':
              this.addNote(new Note(posX, posY, fileReader.result!.toString()));
              break;
            default:
              this.snackBar.open('Type ' + fileType.toUpperCase() + ' not supported',
                undefined, {duration: 4000});
              break;
          }
        }
      }
      fileReader.readAsText(file);
    } else if (data.kind === 'string') {
      let draggedText = event.dataTransfer.getData('text');
      this.addNote(new Note(posX, posY, draggedText));
    }
  }

  private writeNotes(json: string) {
    let currentNotes: Note[] = this.notes$.getValue() ?? [];
    let currentTaskLists: TaskList[] = this.taskLists$.getValue() ?? [];

    let uploadedData = JSON.parse(json) as NotesJson;
    let uploadedNotes = uploadedData.notes;
    let uploadedTaskLists = uploadedData.taskLists;

    uploadedNotes?.forEach((upload: Note) => {
      if (!currentNotes.some(curr => {
        return upload.content === curr.content
          && upload.header === curr.header
          && upload.posX === curr.posX
          && upload.posY === curr.posY
      })) {
        currentNotes.push(upload);
      }
    })
    uploadedTaskLists?.forEach((upload: TaskList) => {
      if (!currentTaskLists.some(curr => {
        return upload.header === curr.header
          && upload.posX === curr.posX
          && upload.posY === curr.posY
      })) {
        currentTaskLists.push(upload);
      }
    })

    this.notes$.next(currentNotes);
    this.taskLists$.next(currentTaskLists);
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
      this.addNote(newNote);
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
      let currentTasks = this.taskLists$.getValue() ?? [];
      currentTasks?.push(newTaskList);
      this.taskLists$.next(currentTasks);
    });
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
