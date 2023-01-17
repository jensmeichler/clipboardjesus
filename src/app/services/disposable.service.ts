import {Injectable, OnDestroy} from '@angular/core';
import {Subject} from "rxjs";

/**
 * Base service to handle subscriptions.
 */
@Injectable({
  providedIn: 'root',
})
export class DisposableService implements OnDestroy {
  /**
   * Subject to use in subscriptions which should be completed on destroy.
   * @example
   *  this.someService
   *    .getObservable()
   *    .pipe(
   *      takeUntil(this.destroy$)
   *    )
   *  .subscribe(() => {
   *    // do something
   *  });
   */
  protected destroy$ = new Subject<void>();

  /**
   * Complete all subscriptions.
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
