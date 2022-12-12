import {DraggableNoteBase} from "./draggable-note-base.model";
import {Note} from "./note.model";

export class NoteList extends DraggableNoteBase {
  notes: Note[] = [];
  header?: string;
  foregroundColor: string = '#ffffff';
  backgroundColor: string = '#212121';
  backgroundColorGradient?: string;

  constructor(
    id: string | null,
    posX: number,
    posY: number,
    posZ?: number
  ) {
    super(id, posX, posY, posZ);
  }
}
