import {Directive, HostListener} from '@angular/core';
import {SettingsService} from "../services";

@Directive({
  selector: '[customCursor]'
})
export class CustomCursorDirective {
  cursor: HTMLElement;
  position?: HTMLElement;
  moving = false;
  timer?: number;
  text?: string;

  constructor(private readonly settings: SettingsService) {
    this.cursor = document.getElementById('cursor')!;
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: any): void {
    if (this.settings.animationsDisabled) return;

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

    event.path.forEach((elem: any) => {
      if (!['NOTE', 'NOTE-LIST', 'TASK-LIST', 'IMAGE'].includes(elem.tagName)) return;

      isDraggableNote = true;
      const posX = CustomCursorDirective.convertPxToInt(elem.style.left);
      const posY = CustomCursorDirective.convertPxToInt(elem.style.top);
      const posZ = CustomCursorDirective.convertPxToInt(elem.style.zIndex);

      this.position!.style.bottom = '0';
      if (elem.style.transform) {
        const splitted = elem.style.transform.split('(')[1].split(', ');
        const translateX = CustomCursorDirective.convertPxToInt(splitted[0]);
        const translateY = CustomCursorDirective.convertPxToInt(splitted[1]);
        this.setText(`${elem.tagName}: { X: ${translateX + posX} | Y: ${translateY + posY} | Z: ${posZ} }`);
      } else {
        this.setText(`${elem.tagName}: { X: ${posX} | Y: ${posY} | Z: ${posZ} }`);
      }
    });

    if (!isDraggableNote) {
      this.position!.style.bottom = '-20px';
    }
  }

  @HostListener('document:mouseleave')
  onWindowLeave(): void {
    if (this.settings.animationsDisabled) return;

    this.position!.style.bottom = '-20px';
    this.cursor.style.display = 'none';
  }

  private setText(value: string): void {
    if (value === this.text) return;
    if (this.position) this.position.innerText = value;
    this.text = value;
  }

  private static convertPxToInt(value: string): number {
    return +value.split('px')[0];
  }
}
