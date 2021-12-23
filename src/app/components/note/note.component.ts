import {Clipboard} from "@angular/cdk/clipboard";
import {Component, Input, OnDestroy, ViewChild} from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {Subscription} from "rxjs";
import {Note} from "../../models";
import {EditNoteDialogComponent} from "../dialogs/edit-note-dialog/edit-note-dialog.component";
import {HashyService} from "../../services/hashy.service";
import {DataService} from "../../services/data.service";
import {MatMenuTrigger} from "@angular/material/menu";

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
  selected = false;

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
    this.selected = !this.selected;
    this.dataService.selectNote(this.note, this.selected);
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
    this.clipboard.copy(this.note.content);
    this.hashy.show('Copied to clipboard', 600);
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
