import {Component, Input} from '@angular/core';
import {Note, NoteList} from "../../models";
import {CdkDragDrop, moveItemInArray, transferArrayItem} from "@angular/cdk/drag-drop";
import {DataService, HashyService} from "../../services";
import {Clipboard} from "@angular/cdk/clipboard";

@Component({
  selector: 'note-list',
  templateUrl: './note-list.component.html',
  styleUrls: ['./note-list.component.scss']
})
export class NoteListComponent {
  @Input() noteList = {} as NoteList;

  constructor(
    private readonly clipboard: Clipboard,
    private readonly hashy: HashyService,
    public readonly dataService: DataService
  ) {
  }

  copy(note: Note): void {
    if (!note.content) return;
    this.clipboard.copy(note.content);
    this.hashy.show('Copied to clipboard', 600);
  }

  dropItem(event: CdkDragDrop<Note[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(this.noteList.notes, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        this.noteList.notes,
        event.previousIndex,
        event.currentIndex,
      );
    }

    this.dataService.cacheData();
  }
}
