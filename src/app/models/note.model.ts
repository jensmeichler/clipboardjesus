import {colorRegex} from "@clipboardjesus/const";
import {DraggableNote} from "@clipboardjesus/models";

export class Note implements DraggableNote {
  content?;
  header?: string;
  foregroundColor: string = '#ffffff';
  backgroundColor: string = '#212121';
  backgroundColorGradient?: string;
  posX: number;
  posY: number;
  posZ?: number;
  selected?: boolean;
  code?: boolean;

  constructor(posX: number, posY: number, content?: string, header?: string, posZ?: number) {
    this.posX = posX;
    this.posY = posY;
    this.posZ = posZ;
    this.header = header;
    this.content = content;

    if (content && colorRegex.test(content)) {
      this.backgroundColor = content;
    }
  }
}
