import {Directive, ElementRef, OnInit} from '@angular/core';

/**
 * Custom implementation of autofocus, because the material one is buggy.
 */
@Directive({
  selector: '[cbAutofocus]',
})
export class AutofocusDirective implements OnInit {
  /**
   * The constructor of the autofocus directive.
   * When you call this constructor manually, you are doing something wrong!
   * @param elementRef The reference to the element onto which the directive is attached to.
   */
  constructor(
    private elementRef: ElementRef,
  ) {}

  /**
   * Focus the element on which the directive is attached to.
   */
  ngOnInit(): void {
    this.elementRef.nativeElement.focus();
  }
}
