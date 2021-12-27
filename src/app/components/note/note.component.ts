import {Clipboard} from "@angular/cdk/clipboard";
import {Component, Input, OnDestroy, ViewChild} from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {MatMenuTrigger} from "@angular/material/menu";
import {Subscription} from "rxjs";
import {Note} from "../../models";
import {DataService} from "../../services/data.service";
import {HashyService} from "../../services/hashy.service";
import {EditNoteDialogComponent} from "../dialogs/edit-note-dialog/edit-note-dialog.component";

@Component({
  selector: 'note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.css']
})
export class NoteComponent implements OnDestroy {
  @Input()
  note: Note = {} as Note;

  dialogSubscription?: Subscription;

  disabled = false;

  constructor(
    private readonly clipboard: Clipboard,
    private readonly hashy: HashyService,
    private readonly dialog: MatDialog,
    public readonly dataService: DataService
  ) {
  }

  ngOnDestroy() {
    this.dialogSubscription?.unsubscribe();
  }

  select() {
    this.note.selected = !this.note.selected;
    this.dataService.onSelectionChange(this.note);
  }

  click(event: any) {
    switch (event.button) {
      case 0:
        this.copy();
        break;
      case 1:
        this.delete();
        break;
      case 2:
        break;
    }
    event.stopPropagation();
  }

  copy() {
    if (this.note.content) {
      this.clipboard.copy(this.note.content);
      this.hashy.show('Copied to clipboard', 600);
    }
  }

  edit() {
    this.dialogSubscription = this.dialog.open(EditNoteDialogComponent, {
      width: 'var(--width-edit-dialog)',
      data: this.note,
    }).afterClosed().subscribe(result => {
      this.dataService.cacheData();
    });
  }

  delete() {
    this.dataService.deleteNote(this.note);
  }

  @ViewChild(MatMenuTrigger)
  contextMenu!: MatMenuTrigger;
  rightClickPosX = 0;
  rightClickPosY = 0;

  showContextMenu(event: any) {
    event.preventDefault();
    this.rightClickPosX = event.clientX;
    this.rightClickPosY = event.clientY;
    this.contextMenu.openMenu();
    event.stopPropagation();
  }
}
