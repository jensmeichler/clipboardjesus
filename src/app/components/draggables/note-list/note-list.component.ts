import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input
} from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {CdkDragDrop, moveItemInArray, transferArrayItem} from "@angular/cdk/drag-drop";
import {Colored, DraggableNote, Note, NoteList} from "@clipboardjesus/models";
import {DataService, ClipboardService} from "@clipboardjesus/services";
import {DraggableComponent, EditNoteDialogComponent, EditNoteListDialogComponent} from "@clipboardjesus/components";
import {DisplayValue} from '@clipboardjesus/helpers';

/**
 * The component which contains other notes.
 */
@Component({
  selector: 'cb-note-list[noteList]',
  templateUrl: './note-list.component.html',
  styleUrls: ['./note-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NoteListComponent extends DraggableComponent {
  /** The note list itself. */
  @Input() noteList!: NoteList;
  /** The event that fires when this component should be rendered again. */
  @Input() changed?: EventEmitter<void>;

  /** Static methods to create the display value to use in the markup. */
  DisplayValue = DisplayValue;

  /**
   * Creates a new note list.
   */
  constructor(
    /** Reference to the material dialog. */
    private readonly dialog: MatDialog,
    /** Reference to the data service. */
    public readonly dataService: DataService,
    /** Reference to the clipboard service. */
    private readonly clipboard: ClipboardService,
    /** Reference to the change detector. */
    private readonly cdr: ChangeDetectorRef,
  ) {
    super();
  }

  /**
   * TODO: get rid of this method and use the one in the base class.
   */
  select(): void {
    this.noteList.selected = !this.noteList.selected;
    this.changed?.emit();
  }

  /**
   * Handles the click onto the note list.
   * @param event
   */
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

  /**
   * Pushes the current clipboard text to the note list.
   * Creates a new small note.
   */
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

  /**
   * Opens a dialog to create a new note in this list.
   */
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

  /**
   * Opens a dialog to edit the note list.
   */
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

  /**
   * TODO: get rid of this method and use the one in the base class.
   */
  delete(): void {
    if (!this.canInteract) {
      return;
    }
    this.dataService.deleteNoteList(this.noteList);
  }

  /**
   * Drops the item into the list.
   * @param event
   */
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

  /**
   * Opens a dialog to edit the given note.
   * @param noteToEdit
   */
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

  /**
   * TODO: get rid of this method and use the one in the base class.
   */
  deleteNote(note: Note): void {
    if (!this.canInteract) {
      return;
    }
    this.noteList.notes = this.noteList.notes.filter(x => x !== note);
    this.dataService.cacheData();
  }

  /**
   * TODO: get rid of this method and use the one in the base class.
   */
  moveToTab(index: number): void {
    this.dataService.moveNoteListToTab(index, this.noteList);
    this.cdr.markForCheck();
  }

  /**
   * TODO: get rid of this method and use the one in the base class.
   */
  copyColorFrom(item: Colored): void {
    this.noteList.backgroundColor = item.backgroundColor;
    this.noteList.backgroundColorGradient = item.backgroundColorGradient;
    this.noteList.foregroundColor = item.foregroundColor;
    this.cdr.markForCheck();
    this.dataService.cacheData();
  }

  /**
   * TODO: get rid of this method and use the one in the base class.
   */
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
