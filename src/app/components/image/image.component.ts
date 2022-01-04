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

  imageLoaded = false;

  rippleDisabled = false;

  // Hack for suppress copy after dragging note
  mouseDown = false;
  movedPx = 0;

  constructor(
    private readonly hashy: HashyService,
    private readonly clipboard: Clipboard,
    public readonly dataService: DataService) {
  }

  onImageLoaded() {
    this.imageLoaded = true
  }

  select() {
    this.image.selected = !this.image.selected;
    this.dataService.onSelectionChange(this.image);
  }

  onMouseDown() {
    this.mouseDown = true;
  }

  onMouseMove() {
    if (this.mouseDown) {
      this.movedPx++;
    }
  }

  onMouseUp(event: any) {
    switch (event.button) {
      case 0:
        if (this.movedPx < 5) {
          if (event.ctrlKey || event.shiftKey) {
            this.select();
          } else {
            this.copy();
          }
        }
        break;
      case 1:
        this.delete();
        break;
      case 2:
        break;
    }
    this.mouseDown = false;
    this.movedPx = 0;
    event.stopPropagation();
  }

  open() {
    window.open(this.image.source, '_blank');
  }

  copy() {
    this.clipboard.copy(this.image.source);
    this.hashy.show('Copied link to clipboard', 600);
  }

  delete() {
    this.dataService.deleteImage(this.image);
  }

  moveToTab(index: number) {
    this.dataService.moveImageToTab(index, this.image);
  }

  @ViewChild(MatMenuTrigger)
  contextMenu!: MatMenuTrigger;
  rightClickPosX = 0;
  rightClickPosY = 0;

  showContextMenu(event: any) {
    event.preventDefault();
    this.rightClickPosX = event.clientX;
    this.rightClickPosY = event.clientY;
    this.contextMenu.openMenu();
    event.stopPropagation();
  }
}
