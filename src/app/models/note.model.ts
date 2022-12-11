import {colorRegex} from "@clipboardjesus/const";
import {DraggableNoteBase} from "./draggable-note-base.model";

export class Note extends DraggableNoteBase {
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
    posZ?: number
  ) {
    super(id, posX, posY, posZ);

    if (content && colorRegex.test(content)) {
      this.backgroundColor = content;
    }
  }
}
