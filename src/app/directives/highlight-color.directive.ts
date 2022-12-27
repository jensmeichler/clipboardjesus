import {
  ChangeDetectorRef,
  Directive,
  HostBinding,
  HostListener,
  Input
} from '@angular/core';
import {DraggableNote} from "@clipboardjesus/models";
import {SettingsService} from "@clipboardjesus/services";
import {scrolledPosition} from "@clipboardjesus/const";

@Directive({selector: '[cbHighlightColor]'})
export class HighlightColorDirective {
  private _cbHighlightColor?: string;

  private _cursorX = 0;
  private _cursorY = 0;
  private _radEffectWidth = 0;

  private _scrollTimeOuts: number[] = [];
  private _moveInterval?: NodeJS.Timeout;

  @Input()
  set cbHighlightColor(value: string | undefined) {
    this._cbHighlightColor = value;
    this._radEffectWidth = 0;
  }

  @Input() cbHighlightedItem?: DraggableNote;

  constructor(
    private readonly settings: SettingsService,
    protected readonly cdr: ChangeDetectorRef,
  ) {}

  @HostBinding('style.transition') transition = 'filter ease-in-out .18s';

  @HostBinding('style.filter')
  get filter(): string {
    return this._radEffectWidth ? 'brightness(0.9)' : 'none';
  }

  @HostBinding('style.background-image')
  get background(): string {
    return (this._cbHighlightColor ? `linear-gradient(to bottom, transparent, ${this._cbHighlightColor}), ` : '')
      + `radial-gradient(circle at ${this._cursorX}px ${this._cursorY}px , `
      + (this._cbHighlightColor ? `${this._cbHighlightColor}67` : 'var(--color-primary-opacity)')
      + ` 0, transparent ${this._radEffectWidth}px, transparent)`;
  }

  @HostListener('wheel', ['$event'])
  onScroll(event: WheelEvent): void {
    if (!this.animationPredicate()) {
      return;
    }

    for (let i = 0; i < 10; i++) {
      this._scrollTimeOuts.push(
        setTimeout(() => {
          if (!this.cbHighlightedItem) {
            return;
          }
          const scrolled = scrolledPosition();
          this._cursorX = event.pageX - this.cbHighlightedItem.posX + scrolled.left;
          this._cursorY = event.pageY - this.cbHighlightedItem.posY + scrolled.top;
        }, i * 30) as unknown as number
      );
    }
  }

  @HostListener('mouseleave', ['$event'])
  onMouseLeave(event: MouseEvent): void {
    if (!this.animationPredicate()) {
      return;
    }

    this.setCursorPosition(event);
    this._moveInterval = setInterval(() => {
      this._radEffectWidth -= 5;
      this.cdr.markForCheck();
      if (this._radEffectWidth <= 0) {
        clearInterval(this._moveInterval);
      }
    }, 10);
  }

  @HostListener('mouseenter')
  onMouseEnter(): void {
    if (!this.animationPredicate()) {
      return;
    }

    clearInterval(this._moveInterval);
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.animationPredicate()) {
      return;
    }

    this._scrollTimeOuts.forEach(timer => clearTimeout(timer));
    this._scrollTimeOuts = [];

    if (event.which !== 1) {
      // When the left mouse button is clicked, the user is probably dragging the object
      this.setCursorPosition(event);
    }

    const maxEffectWidth = 120;
    const currentMovement = Math.abs(event.movementX) + Math.abs(event.movementY);
    if (this._radEffectWidth < maxEffectWidth) {
      const newEffectWith = this._radEffectWidth + currentMovement * 3;
      this._radEffectWidth = newEffectWith < maxEffectWidth
        ? newEffectWith
        : maxEffectWidth;
    }
  }

  private setCursorPosition(event: MouseEvent): void {
    if (!this.cbHighlightedItem) {
      return;
    }
    const scrolled = scrolledPosition();
    this._cursorX = event.pageX - this.cbHighlightedItem.posX + scrolled.left;
    this._cursorY = event.pageY - this.cbHighlightedItem.posY + scrolled.top;
  }

  private animationPredicate(): boolean {
    return this.cbHighlightedItem !== undefined && !this.settings.animationsDisabled;
  }
}
