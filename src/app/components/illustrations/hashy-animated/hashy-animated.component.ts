import {Component, Input} from '@angular/core';
import {HashyService} from "@clipboardjesus/services";

@Component({
  selector: 'cb-hashy-animated',
  templateUrl: './hashy-animated.component.html',
  styleUrls: ['./hashy-animated.component.scss']
})
export class HashyAnimatedComponent {
  @Input() showAlways = false;
  constructor(public readonly hashy: HashyService) {}
}
