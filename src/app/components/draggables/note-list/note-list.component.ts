import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit
} from '@angular/core';
import {Colored, DraggableNote, Note, NoteList} from "@clipboardjesus/models";
import {CdkDragDrop, moveItemInArray, transferArrayItem} from "@angular/cdk/drag-drop";
import {DataService, ClipboardService} from "@clipboardjesus/services";
import {DraggableComponent, EditNoteDialogComponent, EditNoteListDialogComponent} from "@clipboardjesus/components";
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'cb-note-list',
  templateUrl: './note-list.component.html',
  styleUrls: ['./note-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NoteListComponent extends DraggableComponent implements OnInit {
  @Input() noteList!: NoteList;
  @Input() changed?: EventEmitter<void>;

  constructor(
    private readonly dialog: MatDialog,
    public readonly dataService: DataService,
    private readonly clipboard: ClipboardService,
    private readonly cdr: ChangeDetectorRef,
  ) {
    super();
  }

  ngOnInit(): void {
    if (!this.noteList) {
      throw new Error('NoteListComponent.noteList is necessary!');
    }
  }

  select(): void {
    this.noteList.selected = !this.noteList.selected;
    this.changed?.emit();
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
    if (!this.canInteract) {
      return;
    }
    const clipboardText = await this.clipboard.get();
    if (!clipboardText) {
      return;
    }
    this.noteList.notes.push(new Note(null, 0, 0, clipboardText));
    this.cdr.markForCheck();
    this.dataService.cacheData();
  }

  openNewNoteDialog(): void {
    this.dialog.open(EditNoteDialogComponent, {
      width: 'var(--width-edit-dialog)',
      data: new Note(null, 0, 0),
    }).afterClosed().subscribe((addedNote: Note) => {
      if (!addedNote) {
        return;
      }
      this.noteList.notes.push(addedNote);
      this.cdr.markForCheck();
      this.dataService.cacheData();
    });
  }

  edit(): void {
    if (!this.canInteract) {
      return;
    }
    let noteList = JSON.parse(JSON.stringify(this.noteList));
    this.dialog.open(EditNoteListDialogComponent, {
      width: 'var(--width-edit-dialog)',
      data: noteList,
      disableClose: true,
    }).afterClosed().subscribe((editedNoteList: NoteList) => {
      if (editedNoteList) {
        this.dataService.deleteNoteList(this.noteList, true);
        this.dataService.addNoteList(editedNoteList);
        this.cdr.markForCheck();
      }
    });
  }

  delete(): void {
    if (!this.canInteract) {
      return;
    }
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
    if (!this.canInteract) {
      return;
    }
    this.dialog.open(EditNoteDialogComponent, {
      width: 'var(--width-edit-dialog)',
      data: {...noteToEdit},
    }).afterClosed().subscribe((editedNote) => {
      if (!editedNote) {
        return;
      }
      const index = this.noteList.notes.indexOf(noteToEdit);
      this.noteList.notes[index] = editedNote;
      this.cdr.markForCheck();
      this.dataService.cacheData();
    });
  }

  deleteNote(note: Note): void {
    if (!this.canInteract) {
      return;
    }
    this.noteList.notes = this.noteList.notes.filter(x => x !== note);
    this.dataService.cacheData();
  }

  moveToTab(index: number): void {
    this.dataService.moveNoteListToTab(index, this.noteList);
    this.cdr.markForCheck();
  }

  copyColorFrom(item: Colored): void {
    this.noteList.backgroundColor = item.backgroundColor;
    this.noteList.backgroundColorGradient = item.backgroundColorGradient;
    this.noteList.foregroundColor = item.foregroundColor;
    this.cdr.markForCheck();
    this.dataService.cacheData();
  }

  connectTo(item: DraggableNote | undefined): void {
    if (item === undefined) {
      this.dataService.disconnectAll(this.noteList);
    } else {
      this.dataService.connect(this.noteList, item);
    }
    this.changed?.emit();
    this.dataService.cacheData();
  }
}
