import {Clipboard} from "@angular/cdk/clipboard";
import {Component, Input, ViewChild} from '@angular/core';
import {MatMenuTrigger} from "@angular/material/menu";
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
  selected = false;

  constructor(
    private readonly hashy: HashyService,
    private readonly clipboard: Clipboard,
    public readonly dataService: DataService) {
  }

  onLoadingFailed() {
    this.loadingFailed = true
    this.hashy.show('Failed to load image from link', 3000, true);
  }

  select() {
    this.selected = !this.selected;
    this.dataService.selectImage(this.image, this.selected);
  }

  click(event: any) {
    switch (event.button) {
      case 0:
        this.hashy.show('Tip: Double click to open', 3000, true)
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

  copy() {
    this.clipboard.copy(this.image.source);
    this.hashy.show('Copied to clipboard', 600);
  }

  delete() {
    this.dataService.deleteImage(this.image);
  }

  @ViewChild(MatMenuTrigger)
  contextMenu!: MatMenuTrigger;
  rightClickPosX = 0;
  rightClickPosY = 0;

  onRightClick(event: any) {
    event.preventDefault();
    this.rightClickPosX = event.clientX;
    this.rightClickPosY = event.clientY;
    this.contextMenu.openMenu();
    event.stopPropagation();
  }
}
