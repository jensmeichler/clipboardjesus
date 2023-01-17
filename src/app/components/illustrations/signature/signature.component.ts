import {ChangeDetectionStrategy, Component} from '@angular/core';

/**
 * The component which displays the signature of the author.
 */
@Component({
  selector: 'cb-signature',
  templateUrl: './signature.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignatureComponent {}
