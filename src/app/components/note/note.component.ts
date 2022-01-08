import {Clipboard} from "@angular/cdk/clipboard";
import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {MatMenuTrigger} from "@angular/material/menu";
import {Subscription} from "rxjs";
import {Note, TaskList} from "../../models";
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

  @ViewChild(MatMenuTrigger)
  contextMenu!: MatMenuTrigger;
  rightClickPosX = 0;
  rightClickPosY = 0;

  constructor(
    private readonly clipboard: Clipboard,
    private readonly hashy: HashyService,
    private readonly dialog: MatDialog,
    private readonly stringParser: StringParserService,
    public readonly dataService: DataService
  ) {
  }

  get canInteract() {
    return this.movedPx < 5;
  }

  ngOnInit() {
    this.parsedContent = this.stringParser.convert(this.note.content);
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
    if (this.mouseDown && this.canInteract) {
      switch (event.button) {
        case 0:
          if (event.ctrlKey || event.shiftKey) {
            this.select();
          } else {
            this.copy();
          }
          break;
        case 1:
          this.delete(event);
          break;
        case 2:
          break;
      }

      event.stopPropagation();
    }

    this.mouseDown = false;
    this.movedPx = 0;
  }

  copy() {
    if (this.note.content && !this.rippleDisabled && this.canInteract) {
      this.clipboard.copy(this.note.content);
      this.hashy.show('Copied to clipboard', 600);
    }
  }

  edit(event: MouseEvent) {
    if (this.canInteract) {
      let note = {...this.note};
      this.dialogSubscription = this.dialog.open(EditNoteDialogComponent, {
        width: 'var(--width-edit-dialog)',
        data: note,
        disableClose: true,
      }).afterClosed().subscribe((editedNote) => {
        if (editedNote) {
          this.dataService.deleteNote(this.note);
          this.dataService.addNote(editedNote);
        }
      });
      this.rippleDisabled = false;
      event.stopPropagation()
    }
  }

  delete(event: MouseEvent) {
    if (this.canInteract) {
      this.dataService.deleteNote(this.note);
      this.rippleDisabled = false;
      event.stopPropagation();
    }
  }

  moveToTab(index: number) {
    this.dataService.moveNoteToTab(index, this.note);
  }

  copyColorFrom(item: Note | TaskList) {
    this.note.backgroundColor = item.backgroundColor;
    this.note.backgroundColorGradient = item.backgroundColorGradient;
    this.note.foregroundColor = item.foregroundColor;
    this.dataService.cacheData();
  }

  showContextMenu(event: MouseEvent) {
    if (this.canInteract) {
      event.preventDefault();
      this.rightClickPosX = event.clientX;
      this.rightClickPosY = event.clientY;
      this.contextMenu.openMenu();
      event.stopPropagation();
      this.rippleDisabled = false;
    }
  }
}
