import {Clipboard} from "@angular/cdk/clipboard";
import {Component, Input, ViewChild} from '@angular/core';
import {MatMenuTrigger} from "@angular/material/menu";
import {Image} from "../../models";
import {DataService, HashyService} from "../../services";

@Component({
  selector: 'cb-image',
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.scss']
})
export class ImageComponent {
  @Input() image: Image = {} as Image;

  imageLoaded = false;

  rippleDisabled = false;

  mouseDown = false;
  movedPx = 0;

  @ViewChild(MatMenuTrigger)
  contextMenu!: MatMenuTrigger;
  rightClickPosX = 0;
  rightClickPosY = 0;

  constructor(
    private readonly hashy: HashyService,
    private readonly clipboard: Clipboard,
    public readonly dataService: DataService) {
  }

  get canInteract(): boolean {
    return this.movedPx < 5;
  }

  onImageLoaded(): void {
    this.imageLoaded = true
  }

  select(): void {
    this.image.selected = !this.image.selected;
  }

  onMouseDown(event: MouseEvent): void {
    if (event.button !== 2) {
      this.mouseDown = true;
    }
  }

  onMouseMove(): void {
    if (this.mouseDown) {
      this.movedPx++;
    } else {
      this.movedPx = 0;
    }
  }

  onMouseUp(event: MouseEvent): void {
    if (this.mouseDown && this.canInteract) {
      switch (event.button) {
        case 0:
          if (this.movedPx < 5) {
            if (event.ctrlKey || event.metaKey || event.shiftKey) {
              this.select();
            } else {
              this.copy();
            }
          }
          break;
        case 1:
          this.delete(event, true);
          break;
        case 2:
          break;
      }

      event.stopPropagation();
    }

    this.mouseDown = false;
  }

  open(): void {
    window.open(this.image.source, '_blank');
  }

  copy(): void {
    this.clipboard.copy(this.image.source);
    this.hashy.show('Copied link to clipboard', 600);
  }

  delete(event: MouseEvent, force?: boolean): void {
    if (this.movedPx < 5 && (force || this.rippleDisabled)) {
      this.dataService.deleteImage(this.image);
      this.rippleDisabled = false;
      event.stopPropagation();
    }
  }

  moveToTab(index: number): void {
    this.dataService.moveImageToTab(index, this.image);
  }

  showContextMenu(event: MouseEvent): void {
    if (this.canInteract) {
      event.preventDefault();
      event.stopPropagation();

      this.rightClickPosX = event.clientX;
      this.rightClickPosY = event.clientY;
      this.contextMenu.openMenu();
    }

    this.rippleDisabled = false;
    this.mouseDown = false;
  }
}
