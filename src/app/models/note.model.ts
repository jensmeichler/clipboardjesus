import {colorRegex} from "@clipboardjesus/helpers";
import {DraggableNoteBase} from "./draggable-note-base.model";
import {Colored} from "./colored.model";
import {Reminder} from "./reminder.model";

export class Note extends DraggableNoteBase implements Colored {
  foregroundColor: string = '#ffffff';
  backgroundColor: string = '#212121';
  backgroundColorGradient?: string;
  code?: boolean;

  constructor(
    id: string | null,
    posX: number,
    posY: number,
    public content?: string,
    public header?: string,
    posZ?: number,
    public reminder?: Reminder,
  ) {
    super(id, posX, posY, posZ);

    if (content && colorRegex.test(content)) {
      this.backgroundColor = content;
    }
  }
}
