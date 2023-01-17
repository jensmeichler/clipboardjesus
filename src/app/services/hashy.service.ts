import {ApplicationRef, Injectable} from '@angular/core';
import {MatSnackBar} from "@angular/material/snack-bar";
import {BehaviorSubject, combineLatest, of} from "rxjs";
import {TranslateService} from "@ngx-translate/core";

/**
 * The service which handles the snackbar.
 * The snackbar is combined with hashy (the mascot).
 */
@Injectable({
  providedIn: 'root',
})
export class HashyService {
  /** Whether hashy should be displayed. */
  showHashy = new BehaviorSubject(false);

  /**
   * The service which handles the snackbar.
   * @param snackBar
   * @param appRef
   * @param translate
   */
  constructor(
    private readonly snackBar: MatSnackBar,
    private readonly appRef: ApplicationRef,
    private readonly translate: TranslateService,
  ) {}

  /**
   * Opens a snackbar in the bottom left corner of the app.
   * If you call the method twice, the last call will overwrite the first one.
   * @param text The text which will be shown in the snackbar.
   * @param milliseconds The time in milliseconds the snackbar will stay.
   * @param button The text that appears on the button. If undefined, no button will be displayed.
   * @param buttonAction The action that will be called if the user clicks the button.
   * @param dismissAction The action that will be called if the snackbar expires
   * (after the amount of {@link milliseconds} exceeded).
   */
  show(
    text: string | { text: string, interpolateParams: Object },
    milliseconds: number,
    button?: string,
    buttonAction?: Function,
    dismissAction?: Function
  ): void {
    const hasParams = typeof text !== 'string';
    const snackbarText = hasParams ? text.text : text;
    const interpolateParams = hasParams ? text.interpolateParams : undefined;

    combineLatest([
      this.translate.get(snackbarText, interpolateParams),
      button ? this.translate.get(button) : of(undefined)
    ])
      .subscribe(([translatedText, translatedButton]) => {
        this.showHashy.next(true);

        let snackBarRef = this.snackBar.open(translatedText, translatedButton, {
          duration: milliseconds,
          horizontalPosition: "left"
        });

        snackBarRef.afterDismissed().subscribe(() => {
          this.showHashy.next(false);
          dismissAction?.();
          this.appRef.tick();
        })

        if (buttonAction) {
          snackBarRef.onAction().subscribe(() => {
            buttonAction();
            this.showHashy.next(false);
            this.appRef.tick();
          });
        }
      }
    )
  }
}
