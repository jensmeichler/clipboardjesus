import {Component, Input, ViewChild} from '@angular/core';
import {Note, NoteList} from "../../models";
import {CdkDragDrop, moveItemInArray, transferArrayItem} from "@angular/cdk/drag-drop";
import {DataService, HashyService} from "../../services";
import {Clipboard} from "@angular/cdk/clipboard";
import {EditNoteDialogComponent, EditNoteListDialogComponent} from "../dialogs";
import {MatDialog} from "@angular/material/dialog";
import {MatMenuTrigger} from "@angular/material/menu";

@Component({
  selector: 'note-list',
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
    private readonly clipboard: Clipboard,
    private readonly hashy: HashyService,
    public readonly dataService: DataService
  ) {
  }

  get canInteract() {
    return this.movedPx < 5;
  }

  select() {
    this.noteList.selected = !this.noteList.selected;
  }

  onMouseDown(event: MouseEvent) {
    if (event.button !== 2) {
      this.mouseDown = true;
    }
  }

  onMouseMove() {
    if (this.mouseDown) {
      this.movedPx++;
    } else {
      this.movedPx = 0;
    }
  }

  onMouseUp(event: MouseEvent) {
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

  edit() {
    if (this.canInteract) {
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
  }

  delete() {
    if (!this.canInteract) return;
    this.dataService.deleteNoteList(this.noteList);
  }

  copy(note: Note): void {
    if (!note.content) return;
    this.clipboard.copy(note.content);
    this.hashy.show('Copied to clipboard', 600);
  }

  dropItem(event: CdkDragDrop<Note[]>) {
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

  editNote(noteToEdit: Note) {
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

  deleteNote(note: Note) {
    if (!this.canInteract) return;
    this.noteList.notes = this.noteList.notes.filter(x => x !== note);
    this.dataService.cacheData();
  }

  moveToTab(index: number) {
    this.dataService.moveNoteListToTab(index, this.noteList);
  }

  showContextMenu(event: MouseEvent) {
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
