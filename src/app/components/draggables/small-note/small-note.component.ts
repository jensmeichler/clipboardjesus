import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  ViewChild
} from '@angular/core';
import {Colored, Note, NoteList} from "@clipboardjesus/models";
import {DataService, HashyService, ClipboardService} from "@clipboardjesus/services";
import {MatMenuTrigger} from "@angular/material/menu";
import {EditNoteDialogComponent} from "@clipboardjesus/components";
import {MatDialog} from "@angular/material/dialog";

/**
 * The component which is contained in note lists.
 */
@Component({
  selector: 'cb-small-note[note][noteList]',
  templateUrl: './small-note.component.html',
  styleUrls: ['./small-note.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SmallNoteComponent {
  /** The note itself. */
  @Input() note!: Note;
  /** The parent note list which contains this. */
  @Input() noteList!: NoteList;

  /** The context menu binding. */
  @ViewChild(MatMenuTrigger)
  contextMenu!: MatMenuTrigger;

  /**
   * Create an instance of the component.
   */
  constructor(
    /** Reference to the hashy service. */
    private readonly hashy: HashyService,
    /** Reference to the material dialog. */
    private readonly dialog: MatDialog,
    /** Reference to the clipboard service. */
    private readonly clipboard: ClipboardService,
    /** Reference to the data service. */
    protected readonly dataService: DataService,
    /** Reference to the change detector. */
    private readonly cdr: ChangeDetectorRef,
  ) {}

  /**
   * Copy the note's content to the clipboard.
   */
  async copy(): Promise<void> {
    if (!this.note?.content) {
      return;
    }
    await this.clipboard.set(this.note.content);
    this.hashy.show('COPIED_TO_CLIPBOARD', 600);
  }

  /**
   * Open the edit dialog.
   */
  edit(): void {
    const note = {...this.note};
    this.dialog.open(EditNoteDialogComponent, {
      width: 'var(--width-edit-dialog)',
      data: note,
      disableClose: true,
    }).afterClosed().subscribe((editedNote: Note) => {
      if (editedNote) {
        Object.assign(this.note, editedNote);
        this.dataService.cacheData();
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * TODO: get rid of this method and use the one in the base class.
   */
  delete(): void {
    if (!this.note || !this.noteList) {
      return;
    }
    this.noteList.notes = this.noteList.notes.filter(x => x !== this.note);
    this.cdr.markForCheck();
    this.dataService.cacheData();
  }

  /**
   * TODO: get rid of this method and use the one in the base class.
   */
  copyColorFrom(item: Colored): void {
    if (!this.note) {
      return;
    }
    this.note.backgroundColor = item.backgroundColor;
    this.note.backgroundColorGradient = item.backgroundColorGradient;
    this.note.foregroundColor = item.foregroundColor;
    this.cdr.markForCheck();
    this.dataService.cacheData();
  }

  /**
   * Trigger the context menu positioned under the small note.
   */
  showContextMenu(event: MouseEvent): void {
    if (this.dataService.selectedItemsCount) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.contextMenu.openMenu();
  }
}
