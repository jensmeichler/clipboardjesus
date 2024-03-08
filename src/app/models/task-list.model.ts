import {TaskItem} from "./task-item.model";
import {DraggableNoteBase} from "./draggable-note-base.model";
import {Colored} from "./colored.model";

/**
 * Represents a list of tasks.
 */
export class TaskList extends DraggableNoteBase implements Colored {
  /** The color of the text. */
  foregroundColor: string = 'var(--color-note-accent)';
  /** The color of the background. */
  backgroundColor: string = 'var(--color-note)';
  /** The color of the background gradient if specified. */
  backgroundColorGradient?: string;

  /** The tasks in the list. */
  items: TaskItem[] = [];

  /**
   * Default constructor for task lists.
   * @param id Will be generated automatically when null is provided.
   * @param posX How far from the left border of the tab the item is positioned.
   * @param posY How far from the top border of the tab the item is positioned.
   * @param header The header of the task list.
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
