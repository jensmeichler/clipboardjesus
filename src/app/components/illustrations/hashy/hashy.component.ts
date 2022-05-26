import {Component, Input} from '@angular/core';
import {HashyService} from "../../../services";

@Component({
  selector: 'cb-hashy',
  templateUrl: './hashy.component.html',
  styleUrls: ['./hashy.component.css']
})
export class HashyComponent {
  @Input() showAlways = false;
  constructor(public readonly hashy: HashyService) {}
}
