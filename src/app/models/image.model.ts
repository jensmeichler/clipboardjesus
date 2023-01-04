import {DraggableNoteBase} from "./draggable-note-base.model";

export class Image extends DraggableNoteBase {
  constructor(
    id: string | null,
    posX: number,
    posY: number,
    public source: string | null,
    public header?: string
  ) {
    super(id, posX, posY);
  }
}
