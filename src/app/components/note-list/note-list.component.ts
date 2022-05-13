import {Component, Input, ViewChild} from '@angular/core';
import {Note, NoteList} from "../../models";
import {CdkDragDrop, moveItemInArray, transferArrayItem} from "@angular/cdk/drag-drop";
import {DataService} from "../../services";
import {EditNoteDialogComponent, EditNoteListDialogComponent} from "../dialogs";
import {MatDialog} from "@angular/material/dialog";
import {MatMenuTrigger} from "@angular/material/menu";

@Component({
  selector: 'cb-note-list',
  templateUrl: './note-list.component.html',
  styleUrls: ['./note-list.component.scss']
})
export class NoteListComponent {
  @Input() noteList = {} as NoteList;

  mouseDown = false;
  movedPx = 0;

  @ViewChild(MatMenuTrigger)
  contextMenu!: MatMenuTrigger;
  rightClickPosX = 0;
  rightClickPosY = 0;

  constructor(
    private readonly dialog: MatDialog,
    public readonly dataService: DataService
  ) {
  }

  get canInteract(): boolean {
    return this.movedPx < 5;
  }

  select(): void {
    this.noteList.selected = !this.noteList.selected;
  }

  onMouseDown(event: MouseEvent): void {
    if (event.button !== 2) {
      this.mouseDown = true;
    }
  }

  onMouseMove(): void {
    if (this.mouseDown) {
      this.movedPx++;
    } else {
      this.movedPx = 0;
    }
  }

  onMouseUp(event: MouseEvent): void {
    if (this.mouseDown && this.canInteract) {
      switch (event.button) {
        case 0:
          if (event.ctrlKey || event.metaKey || event.shiftKey) {
            this.select();
          }
          break;
        case 1:
          this.delete();
          break;
        case 2:
          break;
      }

      event.stopPropagation();
    }

    this.mouseDown = false;
  }

  async addFromClipboard(): Promise<void> {
    if (!this.canInteract) return;
    const clipboardText = await navigator.clipboard.readText();
    this.noteList.notes.push(new Note(0, 0, clipboardText));
    this.dataService.cacheData();
  }

  openNewNoteDialog(): void {
    this.dialog.open(EditNoteDialogComponent, {
      width: 'var(--width-edit-dialog)',
      data: new Note(0, 0),
    }).afterClosed().subscribe((addedNote: Note) => {
      if (!addedNote) return;
      this.noteList.notes.push(addedNote);
      this.dataService.cacheData();
    });
  }

  edit(): void {
    if (!this.canInteract) return;
    let noteList = JSON.parse(JSON.stringify(this.noteList));
    this.dialog.open(EditNoteListDialogComponent, {
      width: 'var(--width-edit-dialog)',
      data: noteList,
      disableClose: true,
    }).afterClosed().subscribe((editedNoteList: NoteList) => {
      if (editedNoteList) {
        this.dataService.deleteNoteList(this.noteList, true);
        this.dataService.addNoteList(editedNoteList);
      }
    });
  }

  delete(): void {
    if (!this.canInteract) return;
    this.dataService.deleteNoteList(this.noteList);
  }

  dropItem(event: CdkDragDrop<Note[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(this.noteList.notes, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        this.noteList.notes,
        event.previousIndex,
        event.currentIndex,
      );
    }

    this.dataService.cacheData();
  }

  editNote(noteToEdit: Note): void {
    if (!this.canInteract) return;
    this.dialog.open(EditNoteDialogComponent, {
      width: 'var(--width-edit-dialog)',
      data: {...noteToEdit},
    }).afterClosed().subscribe((editedNote) => {
      if (!editedNote) return;
      const index = this.noteList.notes.indexOf(noteToEdit);
      this.noteList.notes[index] = editedNote;
      this.dataService.cacheData();
    });
  }

  deleteNote(note: Note): void {
    if (!this.canInteract) return;
    this.noteList.notes = this.noteList.notes.filter(x => x !== note);
    this.dataService.cacheData();
  }

  moveToTab(index: number): void {
    this.dataService.moveNoteListToTab(index, this.noteList);
  }

  showContextMenu(event: MouseEvent): void {
    if (this.canInteract) {
      event.preventDefault();
      event.stopPropagation();

      this.rightClickPosX = event.clientX;
      this.rightClickPosY = event.clientY;
      this.contextMenu.openMenu();
    }
    this.mouseDown = false;
  }
}
