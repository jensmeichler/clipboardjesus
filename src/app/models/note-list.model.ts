import {Note} from "./note.model";
import {DraggableNote} from "./draggable-note.model";

export class NoteList implements DraggableNote {
  posX: number;
  posY: number;
  posZ?: number;
  selected?: boolean;
  notes: Note[] = [];

  constructor(posX: number, posY: number, posZ?: number) {
    this.posX = posX;
    this.posY = posY;
    this.posZ = posZ;
  }
}
