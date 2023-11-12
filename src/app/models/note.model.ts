import {colorRegex} from "@clipboardjesus/helpers";
import {DraggableNoteBase} from "./draggable-note-base.model";
import {Colored} from "./colored.model";
import {Reminder} from "./reminder.model";

/**
 * Represents a note which is created from the clipboard.
 */
export class Note extends DraggableNoteBase implements Colored {
  /** The color of the text. */
  foregroundColor: string = '#ffffff';
  /** The color of the background. */
  backgroundColor: string = '#212121';
  /** The color of the background gradient if specified. */
  backgroundColorGradient?: string;

  /** Whether the text should be highlighted with syntax highlighting. */
  code?: boolean;

  /**
   * Default constructor for notes.
   * @param id Will be generated automatically when null is provided.
   * @param posX How far from the left border of the tab the item is positioned.
   * @param posY How far from the top border of the tab the item is positioned.
   * @param content The content of the note.
   * @param header The header of the note.
   * @param reminder The reminder when the note should be highlighted.
   */
  constructor(
    id: string | null,
    posX: number,
    posY: number,
    public content?: string,
    public header?: string,
    public reminder?: Reminder,
  ) {
    super(id, posX, posY);

    if (content && colorRegex.test(content)) {
      this.backgroundColor = content;
    }
  }
}
