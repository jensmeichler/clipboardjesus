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
    if (!this.mouseDown) {
      return;
    }

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
        this.delete(event);
        break;
      case 2:
        break;
    }
    this.mouseDown = false;
    this.movedPx = 0;
    event.stopPropagation();
  }

  copy() {
    if (this.note.content && this.movedPx < 5) {
      this.clipboard.copy(this.note.content);
      this.hashy.show('Copied to clipboard', 600);
    }
  }

  edit(event: any) {
    if (this.rippleDisabled && this.movedPx < 5) {
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

  delete(event: any, force?: boolean) {
    if (this.movedPx < 5 && (force || this.rippleDisabled)) {
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
  }

  @ViewChild(MatMenuTrigger)
  contextMenu!: MatMenuTrigger;
  rightClickPosX = 0;
  rightClickPosY = 0;

  showContextMenu(event: any) {
    if (this.rippleDisabled) {
      event.preventDefault();
      this.rightClickPosX = event.clientX;
      this.rightClickPosY = event.clientY;
      this.contextMenu.openMenu();
      event.stopPropagation();
      this.rippleDisabled = false;
    }
  }
}
