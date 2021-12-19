import {Component, Input} from '@angular/core';
import {Image} from "../../models";
import {HashyService} from "../../services/hashy.service";
import {DataService} from "../../services/data.service";

@Component({
  selector: 'image',
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.css']
})
export class ImageComponent {
  @Input()
  image: Image = {} as Image;

  loadingFailed = false;

  constructor(
    private readonly hashy: HashyService,
    private readonly dataService: DataService) {
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
    this.dataService.deleteImage(this.image);
  }
}
