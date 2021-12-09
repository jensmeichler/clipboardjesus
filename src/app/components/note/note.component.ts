import {Clipboard} from "@angular/cdk/clipboard";
import {Component, Input} from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {BehaviorSubject} from "rxjs";
import {Note} from "../../models/note.model";
import {EditNoteDialogComponent} from "../dialogs/edit-note-dialog/edit-note-dialog.component";

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

  constructor(
    private readonly clipboard: Clipboard,
    private readonly snackBar: MatSnackBar,
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
    this.snackBar.open('COPIED TO CLIPBOARD', undefined, {duration: 1000})
  }

  edit() {
    this.dialog.open(EditNoteDialogComponent, {
      width: '50vw',
      data: this.note,
    });
  }

  delete() {
    let notes = this.notes$.getValue();
    let filteredNotes = notes!.filter(x => x !== this.note);
    this.notes$.next(filteredNotes!);
  }

  check() {
    this.note.checked = !this.note.checked;
  }
}
