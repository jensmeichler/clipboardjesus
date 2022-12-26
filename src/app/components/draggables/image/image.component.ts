import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit
} from '@angular/core';
import {DraggableNote, Image} from "@clipboardjesus/models";
import {DataService, HashyService, ClipboardService} from "@clipboardjesus/services";
import {_blank} from "@clipboardjesus/const";
import {DraggableComponent} from "@clipboardjesus/components";

@Component({
  selector: 'cb-image',
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageComponent extends DraggableComponent implements OnInit {
  @Input() image!: Image;
  @Input() changed?: EventEmitter<void>;

  imageLoaded = false;

  constructor(
    private readonly hashy: HashyService,
    private readonly clipboard: ClipboardService,
    public readonly dataService: DataService,
    private readonly cdr: ChangeDetectorRef,
  ) {
    super();
  }

  ngOnInit(): void {
    if (!this.image) {
      throw new Error('ImageComponent.image is necessary!');
    }
  }

  onImageLoaded(): void {
    this.imageLoaded = true;
    this.cdr.markForCheck();
  }

  select(): void {
    this.image.selected = !this.image.selected;
    this.changed?.emit();
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
    this.clipboard.set(this.image.source).then(() =>
      this.hashy.show('COPIED_URL_TO_CLIPBOARD', 600)
    );
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
    this.cdr.markForCheck();
  }

  connectTo(item: DraggableNote | undefined): void {
    if (item === undefined) {
      this.dataService.disconnectAll(this.image);
    } else {
      this.dataService.connect(this.image, item);
    }
    this.changed?.emit();
    this.dataService.cacheData();
  }
}
