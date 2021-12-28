import {Directive, HostBinding, HostListener} from '@angular/core';

@Directive({
  selector: '[customDragDrop]'
})
export class CustomDragDropDirective {
  @HostBinding('class')
  elementClass = 'clipboard';

  @HostListener("dragover", ["$event"])
  @HostListener("dragenter", ["$event"])
  onDragging(event: any) {
    this.elementClass = 'clipboard clipboard-hover';
    event.preventDefault();
  }

  @HostListener("dragend", ["$event"])
  @HostListener("dragleave", ["$event"])
  onNotDragging(event: any) {
    this.elementClass = 'clipboard';
    event.preventDefault();
  }

  @HostListener("drop", ["$event"])
  onDrop(event: any) {
    this.onNotDragging(event)
    event.stopPropagation();
  }
}
