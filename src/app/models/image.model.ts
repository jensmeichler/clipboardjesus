export class Image {
  source: string;
  posX: number;
  posY: number;
  posZ?: number;

  constructor(posX: number, posY: number, source: string, posZ?: number) {
    this.posX = posX;
    this.posY = posY;
    this.posZ = posZ;
    this.source = source;
  }
}
