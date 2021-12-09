export class Note {
  content = '';
  header?: string;
  foregroundColor: string = '#ffffff';
  backgroundColor: string = '#424242';
  backgroundColorGradient?: string;
  posX: number;
  posY: number;
  checked: boolean = false;

  constructor(posX: number, posY: number, content?: string) {
    this.posX = posX;
    this.posY = posY;
    if (content != undefined) {
      this.content = content;
    } else {
      navigator.clipboard.readText().then((text) => {
        this.content = text;
      });
    }
  }
}
