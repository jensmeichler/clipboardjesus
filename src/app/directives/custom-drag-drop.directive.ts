import {Directive, HostBinding, HostListener} from '@angular/core';

@Directive({
  selector: '[customDragDrop]'
})
export class CustomDragDropDirective {
  counter = 0;

  @HostBinding('class')
  elementClass = 'clipboard';

  @HostListener("dragover", ["$event"])
  onDragOver(event: any): void {
    event.preventDefault();
    this.addClass();
  }

  @HostListener("dragenter", ["$event"])
  onDragEnter(event: any): void {
    event.preventDefault();
    this.counter++;
    this.addClass();
  }

  @HostListener("dragend")
  onDragEnd(): void {
    this.removeClass();
  }

  @HostListener("dragleave")
  onDragLeave(): void {
    if (--this.counter === 0) return;
    this.removeClass();
  }

  @HostListener("drop", ["$event"])
  onDrop(event: any): void {
    event.preventDefault();
    event.stopPropagation();
    this.removeClass();
  }

  private addClass(): void {
    this.elementClass = 'clipboard clipboard-hover';
  }

  private removeClass(): void {
    this.elementClass = 'clipboard';
    this.counter = 0;
  }
}
