import {DraggableNote} from "./draggable-note.model";

export class DraggableNoteBase implements DraggableNote {
  public id: string;

  constructor(
    id: string | null,
    public posX: number,
    public posY: number,
    public posZ?: number,
    public selected?: boolean,
  ) {
    if (!id) {
      this.id = new Date().toISOString();
    } else {
      this.id = id;
    }
  }
}
