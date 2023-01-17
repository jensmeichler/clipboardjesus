import {Directive, HostBinding, HostListener} from '@angular/core';

/**
 * Custom directive to highlight the background
 * and disable some default browser behaviour.
 */
@Directive({
  selector: '[cbDragDrop]',
})
export class DragDropDirective {
  /**
   * dragenter triggers also for child elements of the items.
   * That's why we need the current depth of the hover action.
   */
  private _hoveredSection = 0;

  /**
   * Add the class 'clipboard-hover' when hovered over the tab with a file dragging.
   */
  @HostBinding('class')
  get elementClass(): string {
    return this._hoveredSection === 0
      ? 'clipboard'
      : 'clipboard clipboard-hover';
  }

  /**
   * Prevent the default browser behaviour on drag.
   */
  @HostListener("dragover", ["$event"])
  onDragOver(event: MouseEvent): void {
    event.preventDefault();
  }

  /**
   * Prevent the default browser behaviour on drag enter
   * and increase the hovered depth.
   */
  @HostListener("dragenter", ["$event"])
  onDragEnter(event: MouseEvent): void {
    event.preventDefault();
    this._hoveredSection++;
  }

  /**
   * Remove the dragging state on drag end.
   */
  @HostListener("dragend")
  onDragEnd(): void {
    this._hoveredSection = 0;
  }

  /**
   * Decrease the hovered depth.
   */
  @HostListener("dragleave")
  onDragLeave(): void {
    if (this._hoveredSection === 0) {
      return;
    }
    this._hoveredSection--;
  }

  /**
   * Remove the dragging state on drop.
   */
  @HostListener("drop", ["$event"])
  onDrop(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this._hoveredSection = 0;
  }
}
