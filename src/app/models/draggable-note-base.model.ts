import {DraggableNote} from "./draggable-note.model";
import {sessionIdAutoIncrement} from "../helpers";

/**
 * The base class for all draggable items.
 */
export class DraggableNoteBase implements DraggableNote {
  /**
   * The unique identifier of the item.
   */
  id: string;

  /**
   * Default constructor for all draggable items.
   * @param id Will be generated automatically when {@link null} is provided.
   * @param posX How far from the left border of the tab the item is positioned.
   * @param posY How far from the top border of the tab the item is positioned.
   * @param posZ Ordering information.
   * @param selected Whether the item is selected by the user.
   * @param connectedTo The ids of the connected items.
   */
  constructor(
    id: string | null,
    /** How far from the left border of the tab the item is positioned. */
    public posX: number,
    /** How far from the top border of the tab the item is positioned. */
    public posY: number,
    /** Ordering information. */
    public posZ?: number,
    /** Whether the item is selected by the user. */
    public selected?: boolean,
    /** The ids of the connected items. When item has no connections, the parameter is undefined. */
    public connectedTo?: string[]
  ) {
    this.id = !id
      ? sessionIdAutoIncrement()
      : id;
  }
}
