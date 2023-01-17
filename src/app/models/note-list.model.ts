import {DraggableNoteBase} from "./draggable-note-base.model";
import {Note} from "./note.model";
import {Colored} from "./colored.model";

/**
 * Represents a list of notes.
 */
export class NoteList extends DraggableNoteBase implements Colored {
  /** The color of the text. */
  foregroundColor: string = '#ffffff';
  /** The color of the background. */
  backgroundColor: string = '#212121';
  /** The color of the background gradient if specified. */
  backgroundColorGradient?: string;

  /** The notes in the list. */
  notes: Note[] = [];

  /**
   * Default constructor for note lists.
   * @param id Will be generated automatically when {@link null} is provided.
   * @param posX How far from the left border of the tab the item is positioned.
   * @param posY How far from the top border of the tab the item is positioned.
   * @param header The header of the note list.
   */
  constructor(
    id: string | null,
    posX: number,
    posY: number,
    /** The header of the list. */
    public header?: string,
  ) {
    super(id, posX, posY);
  }
}
