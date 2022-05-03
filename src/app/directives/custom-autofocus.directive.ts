import {Directive, ElementRef, OnInit} from '@angular/core';

@Directive({
  selector: '[customAutofocus]'
})
export class CustomAutofocusDirective implements OnInit {
  constructor(private elementRef: ElementRef) {}
  ngOnInit(): void {
    this.elementRef.nativeElement.focus();
  }
}
