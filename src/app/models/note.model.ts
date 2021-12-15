export class Note {
  content = '';
  header?: string;
  foregroundColor: string = '#ffffff';
  backgroundColor: string = '#424242';
  backgroundColorGradient?: string;
  posX: number;
  posY: number;

  constructor(posX: number, posY: number, content?: string, header?: string) {
    this.posX = posX;
    this.posY = posY;
    if (header != undefined) {
      this.header = header;
    }
    if (content != undefined) {
      this.content = content;
    } else {
      navigator.clipboard.readText().then((text) => {
        this.content = text;
      });
    }
  }
}
