import {Component, Input} from '@angular/core';
import {DraggableNote} from "@clipboardjesus/models";

@Component({
  selector: 'cb-connection',
  templateUrl: './connection.component.html',
  styleUrls: ['./connection.component.scss']
})
export class ConnectionComponent {
  @Input() from!: DraggableNote;
  @Input() to!: DraggableNote;

  ngOnInit(): void {
    if (!this.from) {
      throw new Error('ConnectionComponent.from input is necessary!');
    }
    if (!this.to) {
      throw new Error('ConnectionComponent.to input is necessary!');
    }
  }
}
