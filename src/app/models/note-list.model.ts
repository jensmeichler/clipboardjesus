import {DraggableNoteBase} from "./draggable-note-base.model";
import {Note} from "./note.model";
import {Colored} from "./colored.model";

export class NoteList extends DraggableNoteBase implements Colored {
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
