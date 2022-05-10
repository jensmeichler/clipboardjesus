import {Note} from "./note.model";
import {DraggableNote} from "./draggable-note.model";

export class NoteList implements DraggableNote {
  notes: Note[] = [];
  header?: string;
  foregroundColor: string = '#ffffff';
  backgroundColor: string = '#212121';
  backgroundColorGradient?: string;
  posX: number;
  posY: number;
  posZ?: number;
  selected?: boolean;

  constructor(posX: number, posY: number, posZ?: number) {
    this.posX = posX;
    this.posY = posY;
    this.posZ = posZ;
  }
}
