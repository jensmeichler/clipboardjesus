import {Directive, HostListener} from '@angular/core';

@Directive({
  selector: '[customCursor]'
})
export class CustomCursorDirective {
  cursor: HTMLElement;
  position?: HTMLElement;
  moving = false;
  timer?: number;
  text?: string;

  constructor() {
    this.cursor = document.getElementById('cursor')!;
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: any) {
    if (!this.position) {
      this.position = document.getElementById('position')!;
    }

    this.cursor.style.display = 'block';
    this.cursor.style.transform = 'translate(' + event.pageX + 'px, ' + event.pageY + 'px)';

    if (this.moving) {
      this.cursor.style.animation = 'none';
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => {
      this.cursor.style.animationName = 'cursor-pulse';
      this.cursor.style.animationDuration = '2s';
      this.cursor.style.animationDelay = '2s';
      this.cursor.style.animationIterationCount = 'infinite';
    }, 200);

    this.moving = true;
    let isDraggableNote = false;

    event.path.forEach((x: any) => {
      if (x.tagName == 'NOTE' || x.tagName == 'TASK-LIST' || x.tagName == 'IMAGE') {
        isDraggableNote = true;
        const posX = CustomCursorDirective.convertPxToInt(x.style.left);
        const posY = CustomCursorDirective.convertPxToInt(x.style.top);
        const posZ = CustomCursorDirective.convertPxToInt(x.style.zIndex);

        this.position!.style.bottom = '0';
        if (x.style.transform) {
          const splitted = x.style.transform.split('(')[1].split(', ');
          const translateX = CustomCursorDirective.convertPxToInt(splitted[0]);
          const translateY = CustomCursorDirective.convertPxToInt(splitted[1]);
          this.setText(x.tagName + ': { X: ' + (translateX + posX) + ' | Y: ' + (translateY + posY) + ' | Z: ' + posZ + ' }');
        } else {
          this.setText(x.tagName + ': { X: ' + posX + ' | Y: ' + posY + ' | Z: ' + posZ + ' }');
        }
      }
    });

    if (!isDraggableNote) {
      this.position!.style.bottom = '-20px';
    }
  }

  @HostListener('document:mouseleave')
  onWindowLeave() {
    this.position!.style.bottom = '-20px';
    this.cursor.style.display = 'none';
  }

  private setText(value: string) {
    if (value != this.text) {
      this.text = value;
      this.position!.innerText = value;
    }
  }

  private static convertPxToInt(value: string): number {
    return +value.split('px')[0];
  }
}
