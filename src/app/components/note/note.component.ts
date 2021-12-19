import {Clipboard} from "@angular/cdk/clipboard";
import {Component, Input} from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {BehaviorSubject} from "rxjs";
import {Note} from "../../models";
import {EditNoteDialogComponent} from "../dialogs/edit-note-dialog/edit-note-dialog.component";
import {HashyService} from "../../services/hashy.service";

@Component({
  selector: 'note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.css']
})
export class NoteComponent {
  @Input()
  note: Note = {} as Note;
  @Input()
  notes$ = new BehaviorSubject<Note[] | null>(null);

  disabled = false;
  selected = false;

  constructor(
    private readonly clipboard: Clipboard,
    private readonly hashy: HashyService,
    private readonly dialog: MatDialog
  ) {
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
    this.hashy.show('Copied to clipboard', 1000);
  }

  edit() {
    this.dialog.open(EditNoteDialogComponent, {
      width: 'var(--width-edit-dialog)',
      data: this.note,
    });
  }

  delete() {
    let notes = this.notes$.getValue();
    let filteredNotes = notes!.filter(x => x !== this.note);
    this.notes$.next(filteredNotes!);
  }
}
