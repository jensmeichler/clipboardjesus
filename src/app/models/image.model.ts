export class Image {
  source: string;
  posX: number;
  posY: number;

  constructor(posX: number, posY: number, source: string) {
    this.posX = posX;
    this.posY = posY;
    this.source = source;
  }
}
