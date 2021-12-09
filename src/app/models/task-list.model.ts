export class TaskList {
  items: string[] = [];
  header?: string;
  foregroundColor: string = '#ffffff';
  backgroundColor: string = '#424242';
  backgroundColorGradient?: string;
  posX: number;
  posY: number;

  constructor(posX: number, posY: number) {
    this.posX = posX;
    this.posY = posY;
  }
}
