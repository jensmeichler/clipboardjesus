export class Note {
  content?;
  header?: string;
  foregroundColor: string = '#ffffff';
  backgroundColor: string = '#424242';
  backgroundColorGradient?: string;
  posX: number;
  posY: number;
  posZ?: number;

  constructor(posX: number, posY: number, content?: string, header?: string, posZ?: number) {
    this.posX = posX;
    this.posY = posY;
    this.posZ = posZ;
    this.header = header;
    this.content = content;
  }
}
