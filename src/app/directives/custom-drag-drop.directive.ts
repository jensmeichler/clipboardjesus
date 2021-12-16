import {Directive, ElementRef, HostListener} from '@angular/core';

@Directive({
  selector: '[customDragDrop]'
})
export class CustomDragDropDirective {
  constructor(private readonly elementRef: ElementRef) {
  }

  @HostListener("dragover", ["$event"])
  @HostListener("dragenter", ["$event"])
  onDragging(event: any) {
    this.elementRef.nativeElement.style.border = '1vh dashed var(--color-accent)';
    event.preventDefault();
  }

  @HostListener("dragend", ["$event"])
  @HostListener("dragleave", ["$event"])
  onNotDragging(event: any) {
    this.elementRef.nativeElement.style.border = '1vh dashed var(--color-background)';
    event.preventDefault();
  }

  @HostListener("drop", ["$event"])
  onDrop(event: any) {
    this.onNotDragging(event)
    event.stopPropagation();
  }
}
