import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {HashyService} from "@clipboardjesus/services";

/**
 * The component which displays the mascot of the application.
 * This component is animated and wears a Christmas hat near the holidays.
 */
@Component({
  selector: 'cb-hashy-animated',
  templateUrl: './hashy-animated.component.html',
  styleUrls: ['./hashy-animated.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HashyAnimatedComponent {
  /**
   * Whether it's Christmas holiday currently
   */
  @Input() christmas!: boolean;

  /**
   * The animated component which displays the mascot of the application.
   * @param hashy The service to know whether to display hashy.
   */
  constructor(
    protected readonly hashy: HashyService,
  ) {}
}
