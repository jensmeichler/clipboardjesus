import {Component, Input, ViewChild} from '@angular/core';
import {Note, NoteList, TaskList} from "../../../models";
import {DataService, HashyService} from "../../../services";
import {Clipboard} from "@angular/cdk/clipboard";
import {MatMenuTrigger} from "@angular/material/menu";
import {EditNoteDialogComponent} from "../../dialogs";
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'cb-small-note',
  templateUrl: './small-note.component.html',
  styleUrls: ['./small-note.component.css']
})
export class SmallNoteComponent {
  @Input() note: Note = new Note(0, 0);
  @Input() noteList?: NoteList;

  @ViewChild(MatMenuTrigger)
  contextMenu!: MatMenuTrigger;
  rightClickPosX = 0;
  rightClickPosY = 0;

  constructor(
    private readonly hashy: HashyService,
    private readonly dialog: MatDialog,
    private readonly clipboard: Clipboard,
    public readonly dataService: DataService
  ) {
  }

  copy(): void {
    if (!this.note?.content) return;
    this.clipboard.copy(this.note.content);
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
      }
    });
  }

  delete(): void {
    if (!this.note || !this.noteList) return;
    this.noteList.notes = this.noteList.notes.filter(x => x !== this.note);
    this.dataService.cacheData();
  }

  copyColorFrom(item: Note | TaskList): void {
    if (!this.note) return;
    this.note.backgroundColor = item.backgroundColor;
    this.note.backgroundColorGradient = item.backgroundColorGradient;
    this.note.foregroundColor = item.foregroundColor;
    this.dataService.cacheData();
  }

  showContextMenu(event: MouseEvent): void {
    if (this.dataService.selectedItemsCount) return;
    event.preventDefault();
    event.stopPropagation();
    this.rightClickPosX = event.clientX;
    this.rightClickPosY = event.clientY;
    this.contextMenu.openMenu();
  }
}
