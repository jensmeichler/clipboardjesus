import {Directive, HostListener, NgZone} from '@angular/core';
import {SettingsService} from "@clipboardjesus/services";

@Directive({selector: '[cbCursor]'})
export class CursorDirective {
  cursor: HTMLElement;
  position?: HTMLElement;
  moving = false;
  timer?: number;
  text?: string;

  constructor(private readonly settings: SettingsService, zone: NgZone) {
    this.cursor = document.getElementById('cursor')!;

    zone.runOutsideAngular(() => {
      // Don't trigger change detection on mouse move
      document.addEventListener('mousemove', this.onMouseMove.bind(this));
    });
  }

  onMouseMove(event: MouseEvent): void {
    if (this.settings.animationsDisabled) {
      return;
    }

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
    }, 200) as unknown as number;

    this.moving = true;
    let isDraggableNote = false;

    event.composedPath().forEach((elem: any) => {
      if (!['CB-NOTE', 'CB-NOTE-LIST', 'CB-TASK-LIST', 'CB-IMAGE'].includes(elem.tagName)) {
        return;
      }

      const tag = elem.tagName.substring(3);

      isDraggableNote = true;
      const posX = CursorDirective.convertPxToInt(elem.style.left);
      const posY = CursorDirective.convertPxToInt(elem.style.top);
      const posZ = CursorDirective.convertPxToInt(elem.style.zIndex);

      this.position!.style.bottom = '0';
      if (elem.style.transform) {
        const split = elem.style.transform.split('(')[1].split(', ');
        const translateX = CursorDirective.convertPxToInt(split[0]);
        const translateY = CursorDirective.convertPxToInt(split[1]);
        this.setText(`${tag}: { X: ${translateX + posX} | Y: ${translateY + posY} | Z: ${posZ} }`);
      } else {
        this.setText(`${tag}: { X: ${posX} | Y: ${posY} | Z: ${posZ} }`);
      }
    });

    if (!isDraggableNote) {
      this.position!.style.bottom = '-22px';
    }
  }

  @HostListener('document:mouseleave')
  onWindowLeave(): void {
    if (this.settings.animationsDisabled) {
      return;
    }

    this.position!.style.bottom = '-22px';
    this.cursor.style.display = 'none';
  }

  private setText(value: string): void {
    if (value === this.text) {
      return;
    }
    if (this.position) this.position.innerText = value;
    this.text = value;
  }

  private static convertPxToInt(value: string): number {
    return +value.split('px')[0];
  }
}
