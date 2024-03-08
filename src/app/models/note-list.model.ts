import {DraggableNoteBase} from "./draggable-note-base.model";
import {Note} from "./note.model";
import {Colored} from "./colored.model";

/**
 * Represents a list of notes.
 */
export class NoteList extends DraggableNoteBase implements Colored {
  /** The color of the text. */
  foregroundColor: string = 'var(--color-note-accent)';
  /** The color of the background. */
  backgroundColor: string = 'var(--color-note)';
  /** The color of the background gradient if specified. */
  backgroundColorGradient?: string;

  /** The notes in the list. */
  notes: Note[] = [];

  /**
   * Default constructor for note lists.
   * @param id Will be generated automatically when null is provided.
   * @param posX How far from the left border of the tab the item is positioned.
   * @param posY How far from the top border of the tab the item is positioned.
   * @param header The header of the note list.
   */
  constructor(
    id: string | null,
    posX: number,
    posY: number,
    public header?: string,
  ) {
    super(id, posX, posY);
  }
}
