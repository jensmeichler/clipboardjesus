import {Directive, ElementRef, HostListener, Input} from '@angular/core';
import {DraggableNote} from "../models";
import {SettingsService} from "../services/settings.service";

@Directive({
  selector: '[cursorBackground]'
})
export class CursorBackgroundDirective {
  private _cursorBackground?: string;

  @Input('cursorBackground')
  set cursorBackground(value: string | undefined) {
    this._cursorBackground = value;
    this.onMouseLeave();
  }

  @Input('cursorBackgroundItem')
  item?: DraggableNote;

  @Input('x') x?: number;
  @Input('y') y?: number;

  radEffectWidth = 0;

  constructor(
    private readonly element: ElementRef,
    private readonly settings: SettingsService
  ) {
  }

  setBackground(absoluteMousePos: { x: number, y: number }): void {
    this.element.nativeElement.style.backgroundImage =
      (this._cursorBackground ? 'linear-gradient(to bottom, transparent, ' + this._cursorBackground + '), ' : '')
      + 'radial-gradient(circle at ' + absoluteMousePos.x + 'px ' + absoluteMousePos.y + 'px , '
      + (this._cursorBackground ?? 'var(--color-primary)')
      + ' 0, transparent ' + this.radEffectWidth + 'px' + ', transparent)';
  }

  @HostListener('mouseenter')
  onMouseEnter() {
    this.radEffectWidth = 0;
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.element.nativeElement.style.backgroundImage = this._cursorBackground
      ? 'linear-gradient(to bottom, transparent, ' + this._cursorBackground + ')'
      : 'none';
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.settings.animationsDisabled) return;

    if (event.which !== 1) {
      const x = event.pageX - (this.x ?? this.item?.posX ?? 0);
      const y = event.pageY - (this.y ?? this.item?.posY ?? 0);
      this.setBackground({x, y});
    }

    if (this.radEffectWidth < 400) {
      this.radEffectWidth += (Math.abs(event.movementX) + Math.abs(event.movementY)) * 4;
    }
  }
}
