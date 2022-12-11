import {colorRegex} from "@clipboardjesus/const";
import {DraggableNoteBase} from "./draggable-note-base.model";

export class Note extends DraggableNoteBase {
  content?;
  header?: string;
  foregroundColor: string = '#ffffff';
  backgroundColor: string = '#212121';
  backgroundColorGradient?: string;
  code?: boolean;

  constructor(
    id: string | null,
    posX: number,
    posY: number,
    content?: string,
    header?: string,
    posZ?: number
  ) {
    super(id, posX, posY, posZ);

    this.header = header;
    this.content = content;

    if (content && colorRegex.test(content)) {
      this.backgroundColor = content;
    }
  }
}
