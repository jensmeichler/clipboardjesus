import {ApplicationRef, Injectable, OnDestroy} from '@angular/core';
import {MatSnackBar} from "@angular/material/snack-bar";
import {BehaviorSubject, Subscription} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class HashyService implements OnDestroy {
  showHashy = new BehaviorSubject(false);

  dismissSubscription?: Subscription;
  actionSubscription?: Subscription;

  constructor(
    private readonly snackBar: MatSnackBar,
    private readonly appRef: ApplicationRef) {
  }

  ngOnDestroy() {
    this.unsubscribeAll();
  }

  show(text: string, milliseconds: number, button?: string, buttonAction?: Function, dismissAction?: Function) {
    this.showHashy.next(true);
    this.unsubscribeAll();

    let snackBarRef = this.snackBar.open(text, button ?? undefined, {
      duration: milliseconds,
      horizontalPosition: "left"
    });

    this.dismissSubscription = snackBarRef.afterDismissed().subscribe(() => {
      this.showHashy.next(false);
      if (dismissAction) {
        dismissAction();
      }
      this.appRef.tick();
    })

    if (buttonAction) {
      this.actionSubscription = snackBarRef.onAction().subscribe(() => {
        buttonAction();
        this.showHashy.next(false);
        this.appRef.tick();
      });
    }
  }

  private unsubscribeAll() {
    this.dismissSubscription?.unsubscribe();
    this.actionSubscription?.unsubscribe();
  }
}
