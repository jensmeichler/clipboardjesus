import {Directive, HostBinding, HostListener} from '@angular/core';

@Directive({
  selector: '[customDragDrop]'
})
export class CustomDragDropDirective {
  counter = 0;

  @HostBinding('class')
  elementClass = 'clipboard';

  @HostListener("dragover", ["$event"])
  onDragOver(event: any) {
    event.preventDefault();
    this.addClass();
  }

  @HostListener("dragenter", ["$event"])
  onDragEnter(event: any) {
    event.preventDefault();
    this.counter++;
    this.addClass();
  }

  @HostListener("dragend")
  onDragEnd() {
    this.removeClass();
  }

  @HostListener("dragleave")
  onDragLeave() {
    this.counter--;
    if (this.counter === 0) {
      this.removeClass();
    }
  }

  @HostListener("drop", ["$event"])
  onDrop(event: any) {
    event.preventDefault();
    event.stopPropagation();
    this.removeClass();
  }

  private addClass() {
    this.elementClass = 'clipboard clipboard-hover';
  }

  private removeClass() {
    this.elementClass = 'clipboard';
    this.counter = 0;
  }
}
