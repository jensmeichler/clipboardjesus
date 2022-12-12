import {Directive, HostBinding, HostListener} from '@angular/core';

@Directive({selector: '[cbDragDrop]'})
export class DragDropDirective {
  private _hoveredSection = 0;

  @HostBinding('class')
  get elementClass(): string {
    return this._hoveredSection === 0
      ? 'clipboard'
      : 'clipboard clipboard-hover';
  }

  @HostListener("dragover", ["$event"])
  onDragOver(event: any): void {
    event.preventDefault();
  }

  @HostListener("dragenter", ["$event"])
  onDragEnter(event: any): void {
    event.preventDefault();
    this._hoveredSection++;
  }

  @HostListener("dragend")
  onDragEnd(): void {
    this._hoveredSection = 0;
  }

  @HostListener("dragleave")
  onDragLeave(): void {
    if (this._hoveredSection === 0) {
      return;
    }
    this._hoveredSection--;
  }

  @HostListener("drop", ["$event"])
  onDrop(event: any): void {
    event.preventDefault();
    event.stopPropagation();
    this._hoveredSection = 0;
  }
}
