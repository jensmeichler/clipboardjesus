import {Component, Input} from '@angular/core';
import {HashyService} from "@clipboardjesus/services";

@Component({
  selector: 'cb-hashy-animated',
  templateUrl: './hashy-animated.component.html',
  styleUrls: ['./hashy-animated.component.scss']
})
export class HashyAnimatedComponent {
  @Input()
  showAlways = false;
  
  christmas: boolean;

  constructor(public readonly hashy: HashyService) {
    const date = new Date();
    this.christmas = date.getMonth() === 11 && date.getDate() <= 27;
  }
}
