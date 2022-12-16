import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  selector: 'cb-hashy',
  templateUrl: './hashy.component.html',
  styleUrls: ['./hashy.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HashyComponent {}
