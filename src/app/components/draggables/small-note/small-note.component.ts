import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, ViewChild} from '@angular/core';
import {Colored, Note, NoteList} from "@clipboardjesus/models";
import {DataService, HashyService, ClipboardService} from "@clipboardjesus/services";
import {MatMenuTrigger} from "@angular/material/menu";
import {EditNoteDialogComponent} from "@clipboardjesus/components";
import {MatDialog} from "@angular/material/dialog";

/**
 * The component which is contained in note lists.
 */
@Component({
  selector: 'cb-small-note',
  templateUrl: './small-note.component.html',
  styleUrls: ['./small-note.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SmallNoteComponent implements OnInit {
  /** The note itself. */
  @Input() note!: Note;
  /** The parent note list which contains this. */
  @Input() noteList!: NoteList;

  /** The context menu binding. */
  @ViewChild(MatMenuTrigger)
  contextMenu!: MatMenuTrigger;

  constructor(
    private readonly hashy: HashyService,
    private readonly dialog: MatDialog,
    private readonly clipboard: ClipboardService,
    public readonly dataService: DataService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  /**
   * Validate the inputs.
   */
  ngOnInit(): void {
    if (!this.note) {
      throw new Error('SmallNoteComponent.note is necessary!');
    }
    if (!this.noteList) {
      throw new Error('SmallNoteComponent.noteList is necessary!');
    }
  }

  async copy(): Promise<void> {
    if (!this.note?.content) {
      return;
    }
    await this.clipboard.set(this.note.content);
    this.hashy.show('COPIED_TO_CLIPBOARD', 600);
  }

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

  delete(): void {
    if (!this.note || !this.noteList) {
      return;
    }
    this.noteList.notes = this.noteList.notes.filter(x => x !== this.note);
    this.cdr.markForCheck();
    this.dataService.cacheData();
  }

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
