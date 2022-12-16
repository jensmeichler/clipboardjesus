import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {HashyService} from "@clipboardjesus/services";

@Component({
  selector: 'cb-hashy-animated',
  templateUrl: './hashy-animated.component.html',
  styleUrls: ['./hashy-animated.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HashyAnimatedComponent {
  @Input() christmas!: boolean;
  constructor(public readonly hashy: HashyService) {
  }
}
