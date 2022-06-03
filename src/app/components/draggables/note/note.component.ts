import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {MatMenuTrigger} from "@angular/material/menu";
import {htmlRegex} from "@clipboardjesus/const";
import {Note, NoteList, TaskList} from "@clipboardjesus/models";
import {DataService, HashyService} from "@clipboardjesus/services";
import {EditNoteDialogComponent} from "@clipboardjesus/components";
import {ClipboardService} from "@clipboardjesus/services";

@Component({
  selector: 'cb-note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.scss']
})
export class NoteComponent implements OnInit {
  @Input() note: Note = {} as Note;

  rippleDisabled = false;

  mouseDown = false;
  movedPx = 0;

  @ViewChild(MatMenuTrigger)
  contextMenu!: MatMenuTrigger;
  rightClickPosX = 0;
  rightClickPosY = 0;

  @ViewChild('code')
  codeElement?: ElementRef;

  constructor(
    private readonly clipboard: ClipboardService,
    private readonly hashy: HashyService,
    private readonly dialog: MatDialog,
    public readonly dataService: DataService,
  ) {
  }

  get canInteract(): boolean {
    return this.movedPx < 5;
  }

  ngOnInit(): void {
    if (this.note.code !== false && this.note.content && htmlRegex.test(this.note.content)) {
      this.note.code = true;
    }
  }

  select(): void {
    this.note.selected = !this.note.selected;
  }

  onMouseDown(event: MouseEvent): void {
    if (event.button !== 2) {
      this.mouseDown = true;
    }
  }

  onMouseMove(): void {
    if (this.mouseDown) {
      this.movedPx++;
    } else {
      this.movedPx = 0;
    }
  }

  onMouseUp(event: MouseEvent): void {
    if (this.mouseDown && this.canInteract) {
      switch (event.button) {
        case 0:
          if (event.ctrlKey || event.metaKey || event.shiftKey) {
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
  }

  copy(): void {
    if (this.note.content && !this.rippleDisabled && this.canInteract) {
      this.clipboard.set(this.note.content);
      this.hashy.show('COPIED_TO_CLIPBOARD', 600);
    }
  }

  edit(event: MouseEvent, stopPropagation?: boolean): void {
    if (this.canInteract) {
      const note = {...this.note};
      this.dialog.open(EditNoteDialogComponent, {
        width: 'var(--width-edit-dialog)',
        data: note,
        disableClose: true,
      }).afterClosed().subscribe((editedNote: Note) => {
        if (editedNote) {
          this.dataService.deleteNote(this.note, true);
          this.dataService.addNote(editedNote);
        }
      });
      this.rippleDisabled = false;
      if (stopPropagation) {
        event.stopPropagation();
      }
    }
  }

  delete(event: MouseEvent): void {
    if (this.canInteract) {
      this.dataService.deleteNote(this.note);
      event.stopPropagation();
    }
  }

  toggleCodeView(event: MouseEvent, stopPropagation?: boolean): void {
    if (this.canInteract) {
      this.note.code = !this.note.code;
      this.rippleDisabled = false;
      if (stopPropagation) {
        event.stopPropagation();
      }
    }
  }

  moveToTab(index: number): void {
    this.dataService.moveNoteToTab(index, this.note);
  }

  copyColorFrom(item: Note | TaskList | NoteList): void {
    this.note.backgroundColor = item.backgroundColor;
    this.note.backgroundColorGradient = item.backgroundColorGradient;
    this.note.foregroundColor = item.foregroundColor;
    this.dataService.cacheData();
  }

  showContextMenu(event: MouseEvent): void {
    if (this.canInteract) {
      event.preventDefault();
      event.stopPropagation();

      this.rightClickPosX = event.clientX;
      this.rightClickPosY = event.clientY;
      this.contextMenu.openMenu();
    }
    this.rippleDisabled = false;
    this.mouseDown = false;
  }
}
