import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {MatMenuTrigger} from "@angular/material/menu";
import {DraggableNote, Image} from "@clipboardjesus/models";
import {DataService, HashyService, ClipboardService} from "@clipboardjesus/services";
import {_blank} from "@clipboardjesus/const";

@Component({
  selector: 'cb-image',
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.scss']
})
export class ImageComponent implements OnInit {
  @Input() image!: Image;

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
    private readonly clipboard: ClipboardService,
    public readonly dataService: DataService,
  ) {
  }

  ngOnInit(): void {
    if (!this.image) {
      throw new Error('ImageComponent.image input is necessary!');
    }
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
    window.open(this.image.source, _blank);
  }

  copy(): void {
    this.clipboard.set(this.image.source);
    this.hashy.show('COPIED_URL_TO_CLIPBOARD', 600);
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

  connectTo(item: DraggableNote | undefined): void {
    if (item === undefined) {
      this.dataService.disconnectAll(this.image);
    } else {
      this.dataService.connect(this.image, item);
    }
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
