import {ChangeDetectionStrategy, Component} from '@angular/core';

/**
 * The component which displays the mascot of the application.
 */
@Component({
  selector: 'cb-hashy',
  templateUrl: './hashy.component.html',
  styleUrls: ['./hashy.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HashyComponent {}
