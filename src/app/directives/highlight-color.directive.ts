import {Directive, ElementRef, HostListener, Input} from '@angular/core';
import {DraggableNote} from "../models";
import {SettingsService} from "../services";

@Directive({
  selector: '[highlightColor]'
})
export class HighlightColorDirective {
  private _highlightColor?: string;

  @Input('highlightColor')
  set highlightColor(value: string | undefined) {
    this._highlightColor = value;
    this.onMouseLeave();
  }

  @Input('highlightedItem')
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
    const highlightColorOpacity = `${this._highlightColor}67`;
    this.element.nativeElement.style.backgroundImage =
      (this._highlightColor ? 'linear-gradient(to bottom, transparent, ' + this._highlightColor + '), ' : '')
      + 'radial-gradient(circle at ' + absoluteMousePos.x + 'px ' + absoluteMousePos.y + 'px , '
      + (this._highlightColor ? highlightColorOpacity : 'var(--color-primary-opacity)')
      + ' 0, transparent ' + this.radEffectWidth + 'px' + ', transparent)';
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.radEffectWidth = 0;
    this.element.nativeElement.style.backgroundImage = this._highlightColor
      ? 'linear-gradient(to bottom, transparent, ' + this._highlightColor + ')'
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

    const maxEffectWidth = 120;
    const currentMovement = Math.abs(event.movementX) + Math.abs(event.movementY);
    if (this.radEffectWidth < maxEffectWidth) {
      const newEffectWith = this.radEffectWidth + currentMovement * 3;
      this.radEffectWidth = newEffectWith < maxEffectWidth
        ? newEffectWith
        : maxEffectWidth;
    }
  }
}
