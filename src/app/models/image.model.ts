import {DraggableNoteBase} from "./draggable-note-base.model";

export class Image extends DraggableNoteBase {
  source: string;

  constructor(
    id: string | null,
    posX: number,
    posY: number,
    source: string,
    posZ?: number
  ) {
    super(id, posX, posY, posZ);

    this.source = source;
  }
}
