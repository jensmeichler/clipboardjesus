import {ChangeDetectorRef, Directive, HostListener, NgZone} from '@angular/core';
import {SettingsService} from "@clipboardjesus/services";

/**
 * Handles the cursor animation and the information box
 * in the bottom left corner of the tab.
 */
@Directive({
  selector: '[cbCursor]',
})
export class CursorDirective {
  /** The reference to the cursor (#cursor in index.html). */
  cursor: HTMLElement;
  /** The reference to the information box in the bottom left corner. */
  position?: HTMLElement;
  /** Whether the cursor is currently moving a draggable item. */
  moving = false;
  /** The timeout after which the fancy animation kicks in. */
  timeout?: NodeJS.Timeout;
  /** The text which is displayed in the bottom left corner. */
  text?: string;

  /**
   * Create an instance of the cursor directive.
   * At runtime there must be just one instance of that directive..
   */
  constructor(
    private readonly settings: SettingsService,
    private readonly cdr: ChangeDetectorRef,
    zone: NgZone,
  ) {
    this.cursor = document.getElementById('cursor')!;

    zone.runOutsideAngular(() => {
      // Don't trigger change detection on mouse move
      document.addEventListener('mousemove', this.onMouseMove.bind(this));
    });
  }

  /**
   * Sets the mouse animation and
   * update the text in the info box.
   */
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
      clearTimeout(this.timeout);
    }
    this.timeout = setTimeout(() => {
      this.cursor.style.animationName = 'cursor-pulse';
      this.cursor.style.animationDuration = '2s';
      this.cursor.style.animationDelay = '2s';
      this.cursor.style.animationIterationCount = 'infinite';
    }, 200);

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
    } else {
      this.cdr.markForCheck();
    }
  }

  /**
   * Remove the info box on leave.
   */
  @HostListener('document:mouseleave')
  onWindowLeave(): void {
    if (this.settings.animationsDisabled) {
      return;
    }

    this.position!.style.bottom = '-22px';
    this.cursor.style.display = 'none';
  }

  /**
   * Set the text of the info box.
   */
  private setText(value: string): void {
    if (value === this.text) {
      return;
    }
    if (this.position) this.position.innerText = value;
    this.text = value;
  }

  /**
   * Converts a string value to a {@link number}.
   */
  private static convertPxToInt(value: string): number {
    return +value.split('px')[0];
  }
}
