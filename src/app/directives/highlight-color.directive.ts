import {Directive, ElementRef, HostListener, Input} from '@angular/core';
import {DraggableNote} from "../models";
import {SettingsService} from "../services";

@Directive({
  selector: '[cbHighlightColor]'
})
export class HighlightColorDirective {
  private _cbHighlightColor?: string;

  @Input()
  set cbHighlightColor(value: string | undefined) {
    this._cbHighlightColor = value;
    this.onMouseLeave();
  }

  @Input()
  cbHighlightedItem?: DraggableNote;

  @Input() x?: number;
  @Input() y?: number;

  radEffectWidth = 0;

  constructor(
    private readonly element: ElementRef,
    private readonly settings: SettingsService
  ) {
  }

  setBackground(absoluteMousePos: { x: number, y: number }): void {
    const highlightColorOpacity = `${this._cbHighlightColor}67`;
    this.element.nativeElement.style.backgroundImage =
      (this._cbHighlightColor ? `linear-gradient(to bottom, transparent, ${this._cbHighlightColor}), ` : '')
      + `radial-gradient(circle at ${absoluteMousePos.x}px ${absoluteMousePos.y}px , `
      + (this._cbHighlightColor ? highlightColorOpacity : 'var(--color-primary-opacity)')
      + ` 0, transparent ${this.radEffectWidth}px, transparent)`;
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.radEffectWidth = 0;
    this.element.nativeElement.style.backgroundImage = this._cbHighlightColor
      ? `linear-gradient(to bottom, transparent, ${this._cbHighlightColor})`
      : 'none';
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (this.settings.animationsDisabled) return;

    if (event.which !== 1) {
      const tabBody = document.documentElement.getElementsByClassName('mat-tab-body-active')[0];
      const scrolledLeft = tabBody.scrollLeft ?? 0;
      const scrolledTop = tabBody.scrollTop ?? 0;

      const x = event.pageX - (this.x ?? this.cbHighlightedItem?.posX ?? 0) + scrolledLeft;
      const y = event.pageY - (this.y ?? this.cbHighlightedItem?.posY ?? 0) + scrolledTop;

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
