import {Directive, ElementRef, OnInit} from '@angular/core';

@Directive({
  selector: '[cbAutofocus]'
})
export class CustomAutofocusDirective implements OnInit {
  constructor(private elementRef: ElementRef) {}
  ngOnInit(): void {
    this.elementRef.nativeElement.focus();
  }
}
