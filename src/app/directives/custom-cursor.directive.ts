import {Directive, HostListener} from '@angular/core';

@Directive({
  selector: '[customCursor]'
})
export class CustomCursorDirective {
  cursor: HTMLElement;

  constructor() {
    this.cursor = document.getElementById('cursor')!;
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: any) {
    this.cursor.style.display = 'block';
    this.cursor.style.transform = 'translate(' + event.pageX + 'px, ' + event.pageY + 'px)';
  }

  @HostListener('document:mouseleave')
  onWindowLeave() {
    this.cursor.style.display = 'none';
  }
}
