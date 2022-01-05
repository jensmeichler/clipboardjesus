import {Clipboard} from "@angular/cdk/clipboard";
import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {MatMenuTrigger} from "@angular/material/menu";
import {Subscription} from "rxjs";
import {Note} from "../../models";
import {DataService} from "../../services/data.service";
import {HashyService} from "../../services/hashy.service";
import {StringParserService} from "../../services/string-parser.service";
import {EditNoteDialogComponent} from "../dialogs/edit-note-dialog/edit-note-dialog.component";

@Component({
  selector: 'note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.css']
})
export class NoteComponent implements OnDestroy, OnInit {
  @Input()
  note: Note = {} as Note;
  parsedContent = '';

  dialogSubscription?: Subscription;

  rippleDisabled = false;

  // Hack for suppress copy after dragging note
  mouseDown = false;
  movedPx = 0;

  constructor(
    private readonly clipboard: Clipboard,
    private readonly hashy: HashyService,
    private readonly dialog: MatDialog,
    private readonly stringParser: StringParserService,
    public readonly dataService: DataService
  ) {
  }

  ngOnInit() {
    this.parsedContent = this.stringParser.convert(this.note.content);
    console.log(this.parsedContent)
  }

  ngOnDestroy() {
    this.dialogSubscription?.unsubscribe();
  }

  select() {
    this.note.selected = !this.note.selected;
    this.dataService.onSelectionChange(this.note);
  }

  onMouseDown() {
    this.mouseDown = true;
  }

  onMouseMove() {
    if (this.mouseDown) {
      this.movedPx++;
    }
  }

  onMouseUp(event: MouseEvent) {
    switch (event.button) {
      case 0:
        if (this.movedPx < 5) {
          if (event.ctrlKey || event.shiftKey) {
            this.select();
          } else {
            this.copy();
          }
        }
        break;
      case 1:
        this.delete();
        break;
      case 2:
        break;
    }
    this.mouseDown = false;
    this.movedPx = 0;
    event.stopPropagation();
  }

  copy() {
    if (this.note.content) {
      this.clipboard.copy(this.note.content);
      this.hashy.show('Copied to clipboard', 600);
    }
  }

  edit() {
    let note = {...this.note};
    this.dialogSubscription = this.dialog.open(EditNoteDialogComponent, {
      width: 'var(--width-edit-dialog)',
      data: note,
    }).afterClosed().subscribe((editedNote) => {
      if (editedNote) {
        this.note = editedNote;
        this.parsedContent = this.stringParser.convert(this.note.content);
        this.dataService.cacheData();
      }
    });
  }

  delete() {
    this.dataService.deleteNote(this.note);
  }

  moveToTab(index: number) {
    this.dataService.moveNoteToTab(index, this.note);
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
