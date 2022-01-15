import {DraggableNote} from "./draggable-note.model";

export class Image implements DraggableNote {
  source: string;
  posX: number;
  posY: number;
  posZ?: number;
  selected?: boolean;

  constructor(posX: number, posY: number, source: string, posZ?: number) {
    this.posX = posX;
    this.posY = posY;
    this.posZ = posZ;
    this.source = source;
  }
}
