import {TaskItem} from "./task-item.model";
import {DraggableNoteBase} from "./draggable-note-base.model";
import {Colored} from "./colored.model";

export class TaskList extends DraggableNoteBase implements Colored {
  items: TaskItem[] = [];
  header?: string;
  foregroundColor: string = '#ffffff';
  backgroundColor: string = '#212121';
  backgroundColorGradient?: string;

  constructor(
    id: string | null,
    posX: number,
    posY: number,
  ) {
    super(id, posX, posY);
  }
}
