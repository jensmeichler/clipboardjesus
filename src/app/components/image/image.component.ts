import {Clipboard} from "@angular/cdk/clipboard";
import {Component, HostListener, Input, ViewChild} from '@angular/core';
import {MatMenuTrigger} from "@angular/material/menu";
import {Image} from "../../models";
import {DataService, HashyService} from "../../services";

@Component({
  selector: 'image',
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.scss']
})
export class ImageComponent {
  @Input() image: Image = {} as Image;

  imageLoaded = false;

  rippleDisabled = false;

  showRadEffect = false;
  radEffectWidth = 0;
  mousePosX = 0;
  mousePosY = 0;

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

  get canInteract() {
    return this.movedPx < 5;
  }

  @HostListener('mouseenter')
  onMouseEnter() {
    this.showRadEffect = true;
    this.radEffectWidth = 0;
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.showRadEffect = false;
  }

  onImageLoaded() {
    this.imageLoaded = true
  }

  select() {
    this.image.selected = !this.image.selected;
  }

  onMouseDown(event: MouseEvent) {
    if (event.button != 2) {
      this.mouseDown = true;
    }
  }

  onMouseMove(event: MouseEvent) {
    if (this.mouseDown) {
      this.movedPx++;
    } else {
      this.movedPx = 0;

      // Hack for rad effect
      this.mousePosX = event.pageX - this.image.posX;
      this.mousePosY = event.pageY - this.image.posY;
    }

    if (this.radEffectWidth < 80) {
      this.radEffectWidth += (Math.abs(event.movementX) + Math.abs(event.movementY)) * 2;
    }
  }

  onMouseUp(event: any) {
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

  open() {
    window.open(this.image.source, '_blank');
  }

  copy() {
    this.clipboard.copy(this.image.source);
    this.hashy.show('Copied link to clipboard', 600);
  }

  delete(event: MouseEvent, force?: boolean) {
    if (this.movedPx < 5 && (force || this.rippleDisabled)) {
      this.dataService.deleteImage(this.image);
      this.rippleDisabled = false;
      event.stopPropagation();
    }
  }

  moveToTab(index: number) {
    this.dataService.moveImageToTab(index, this.image);
  }

  showContextMenu(event: any) {
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
