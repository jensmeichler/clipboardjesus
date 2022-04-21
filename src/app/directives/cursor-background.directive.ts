import {Directive, ElementRef, HostListener, Input, OnInit} from '@angular/core';
import {DraggableNote} from "../models";

@Directive({
  selector: '[cursorBackground]'
})
export class CursorBackgroundDirective implements OnInit {
  @Input('cursorBackground')
  cursorBackground?: string;

  @Input('cursorBackgroundItem')
  item?: DraggableNote;

  radEffectWidth = 0;

  constructor(private readonly element: ElementRef) {
  }

  ngOnInit(): void {
    this.onMouseLeave();
  }

  setBackground(absoluteMousePos: { x: number, y: number }): void {
    if (this.item) {
      this.element.nativeElement.style.backgroundImage =
        (this.cursorBackground ? 'linear-gradient(to bottom, transparent, ' + this.cursorBackground + '), ' : '')
        + 'radial-gradient(circle at ' + absoluteMousePos.x + 'px ' + absoluteMousePos.y + 'px , '
        + (this.cursorBackground ?? 'var(--color-primary)')
        + ' 0, transparent ' + this.radEffectWidth + 'px' + ', transparent)';
    }
  }

  @HostListener('mouseenter')
  onMouseEnter() {
    this.radEffectWidth = 0;
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.element.nativeElement.style.backgroundImage = this.cursorBackground
      ? 'linear-gradient(to bottom, transparent, ' + this.cursorBackground + ')'
      : 'none';
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (event.which !== 1) {
      const x = event.pageX - (this.item?.posX ?? 0);
      const y = event.pageY - (this.item?.posY ?? 0);
      this.setBackground({x, y});
    }

    if (this.radEffectWidth < 400) {
      this.radEffectWidth += (Math.abs(event.movementX) + Math.abs(event.movementY)) * 4;
    }
  }
}
