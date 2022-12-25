import {Component, OnDestroy} from '@angular/core';
import {Subject} from "rxjs";

@Component({
  selector: 'cb-disposable',
  template: '',
})
export class DisposableComponent implements OnDestroy {
  protected destroy$ = new Subject<void>();

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
