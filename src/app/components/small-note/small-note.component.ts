import {Component, Input} from '@angular/core';
import {Note} from "../../models";
import {HashyService} from "../../services";
import {Clipboard} from "@angular/cdk/clipboard";

@Component({
  selector: 'small-note',
  templateUrl: './small-note.component.html',
  styleUrls: ['./small-note.component.css']
})
export class SmallNoteComponent {
  @Input() note?: Note;

  constructor(
    private readonly hashy: HashyService,
    private readonly clipboard: Clipboard
  ) {
  }

  copy(note: Note | undefined): void {
    if (!note?.content) return;
    this.clipboard.copy(note.content);
    this.hashy.show('Copied to clipboard', 600);
  }
}
