import {Component, Input} from '@angular/core';
import {Image} from "../../models";
import {BehaviorSubject} from "rxjs";
import {HashyService} from "../../services/hashy.service";

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

  loadingFailed = false;

  constructor(private readonly hashy: HashyService) {
  }

  onLoadingFailed() {
    this.loadingFailed = true
    this.hashy.show('Failed to show image from link', 4000);
  }

  click(event: any) {
    switch (event.button) {
      case 0:
        this.hashy.show('Tip: Double click to open', 3000)
        break;
      case 1:
        this.delete();
        break;
      case 2:
        break;
    }
    event.stopPropagation();
  }

  open() {
    window.open(this.image.source, '_blank');
  }

  delete() {
    let images = this.images$.getValue();
    let filteredImages = images!.filter(x => x !== this.image);
    this.images$.next(filteredImages!);
  }
}
