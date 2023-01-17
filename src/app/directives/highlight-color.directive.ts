import {
  ChangeDetectorRef,
  Directive,
  HostBinding,
  HostListener,
  Input
} from '@angular/core';
import {DraggableNote} from "@clipboardjesus/models";
import {SettingsService} from "@clipboardjesus/services";
import {scrolledPosition} from "@clipboardjesus/helpers";

/**
 * Directive for the fancy hover effect.
 */
@Directive({
  selector: '[cbHighlightColor]',
})
export class HighlightColorDirective {
  /** The color of the circle. */
  private _cbHighlightColor?: string;
  /** The current cursor position (x) relative to {@property cbHighlightedItem}. */
  private _cursorX = 0;
  /** The current cursor position (y) relative to {@property cbHighlightedItem}. */
  private _cursorY = 0;
  /** The current radius of the effect. */
  private _radEffectWidth = 0;
  /** The {@link NodeJS.Timeout} of the move interval. It must be cleared after the effect animation is done. */
  private _moveInterval?: NodeJS.Timeout;

  /**
   * The color that the cursor circle should have.
   */
  @Input()
  set cbHighlightColor(value: string | undefined) {
    this._cbHighlightColor = value;
    this._radEffectWidth = 0;
  }

  /**
   * The item reference which contains the color information.
   */
  @Input()
  cbHighlightedItem?: DraggableNote;

  /**
   * The constructor of the highlight directive.
   */
  constructor(
    /** The Reference to the settings service. */
    private readonly settings: SettingsService,
    /** The reference to the ChangeDetector for updating the view. */
    private readonly cdr: ChangeDetectorRef,
  ) {}

  /**
   * Manipulate the background image via host binding.
   */
  @HostBinding('style.background-image')
  get background(): string {
    return (this._cbHighlightColor ? `linear-gradient(to bottom, transparent, ${this._cbHighlightColor}), ` : '')
      + `radial-gradient(circle at ${this._cursorX}px ${this._cursorY}px , `
      + (this._cbHighlightColor ? `${this._cbHighlightColor}67` : 'var(--color-primary-opacity)')
      + ` 0, transparent ${this._radEffectWidth}px, transparent)`;
  }

  /**
   * Update the circle position on scroll.
   */
  @HostListener('wheel', ['$event'])
  onScroll(event: WheelEvent): void {
    if (!this.animationPredicate() || !this.cbHighlightedItem) {
      return;
    }

    const scrolled = scrolledPosition();
    this._cursorX = event.pageX - this.cbHighlightedItem.posX + scrolled.left;
    this._cursorY = event.pageY - this.cbHighlightedItem.posY + scrolled.top;
  }

  /**
   * Let the Circle fade out on leave.
   */
  @HostListener('mouseleave', ['$event'])
  onMouseLeave(event: MouseEvent): void {
    if (!this.animationPredicate()) {
      return;
    }

    this.clearMoveInterval();
    this.setCursorPosition(event);

    this._moveInterval = setInterval(() => {
      this._radEffectWidth -= 5;
      this.cdr.markForCheck();
      if (this._radEffectWidth <= 0) {
        this.clearMoveInterval();
      }
    }, 10);
  }

  /**
   * Clear the move interval.
   */
  private clearMoveInterval(): void {
    if (this._moveInterval === undefined) {
      return;
    }
    clearInterval(this._moveInterval);
    this._moveInterval = undefined;
  }

  /**
   * Start the animation on mouse enter.
   */
  @HostListener('mouseenter', ['$event'])
  onMouseEnter(event: MouseEvent): void {
    if (!this.animationPredicate()) {
      return;
    }
    this.clearMoveInterval();
    this.setCursorPosition(event);
  }

  /**
   * Move the circle on mouse move.
   */
  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.animationPredicate()) {
      return;
    }

    this.clearMoveInterval();

    if (event.buttons !== 1) {
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

  /**
   * Set the cursor position.
   * This moves the circle to the given position.
   */
  private setCursorPosition(event: MouseEvent): void {
    if (!this.cbHighlightedItem) {
      return;
    }
    const scrolled = scrolledPosition();
    this._cursorX = event.pageX - this.cbHighlightedItem.posX + scrolled.left;
    this._cursorY = event.pageY - this.cbHighlightedItem.posY + scrolled.top;
  }

  /**
   * Returns whether the animation is enabled.
   */
  private animationPredicate(): boolean {
    return this.cbHighlightedItem !== undefined && !this.settings.animationsDisabled;
  }
}
