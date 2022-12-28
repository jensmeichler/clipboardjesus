import {DraggableNote} from "./draggable-note.model";
import {sessionIdAutoIncrement} from "../helpers";

export class DraggableNoteBase implements DraggableNote {
  id: string;
  connectedTo?: string[];

  constructor(
    id: string | null,
    public posX: number,
    public posY: number,
    public posZ?: number,
    public selected?: boolean,
  ) {
    this.id = !id
      ? new Date().toISOString() + sessionIdAutoIncrement()
      : id;
  }
}
