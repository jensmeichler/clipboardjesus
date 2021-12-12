import {Component, Input} from '@angular/core';
import {Image} from "../../models";
import {BehaviorSubject} from "rxjs";

@Component({
  selector: 'image',
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.css']
})
export class ImageComponent {
  @Input()
  image: Image = {} as Image;
  @Input()
  images$ = new BehaviorSubject<Image[] | null>(null);

  constructor() {
  }

  delete() {
    let images = this.images$.getValue();
    let filteredImages = images!.filter(x => x !== this.image);
    this.images$.next(filteredImages!);
  }
}
