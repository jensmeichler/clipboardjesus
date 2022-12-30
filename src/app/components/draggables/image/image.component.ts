import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit
} from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {DraggableNote, Image} from "@clipboardjesus/models";
import {DataService, HashyService, ClipboardService, StorageService} from "@clipboardjesus/services";
import {_blank, DisplayValue} from "@clipboardjesus/helpers";
import {DraggableComponent, EditImageDialogComponent} from "@clipboardjesus/components";
import {take} from "rxjs";

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
  loadedFromStorage: string | false = false;

  DisplayValue = DisplayValue;

  constructor(
    private readonly hashy: HashyService,
    private readonly clipboard: ClipboardService,
    public readonly dataService: DataService,
    private readonly dialog: MatDialog,
    private readonly storageService: StorageService,
    private readonly cdr: ChangeDetectorRef,
  ) {
    super();
  }

  ngOnInit(): void {
    if (!this.image) {
      throw new Error('ImageComponent.image is necessary!');
    }

    if (this.image.source === null) {
      this.loadedFromStorage = this.storageService.fetchImage(this.image.id) ?? false;
      if (!this.loadedFromStorage) {
        this.storageService.onImgStored.pipe(take(1)).subscribe((id) => {
          if (id !== this.image.id) {
            console.error('failed to fetch image from storage');
          }
          this.loadedFromStorage = this.storageService.fetchImage(this.image.id) ?? false;
          this.cdr.markForCheck();
        });
      }
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
          this.delete();
          break;
        case 2:
          break;
      }

      event.stopPropagation();
    }

    this.mouseDown = false;
  }

  open(): void {
    if (this.image.source) {
      window.open(this.image.source, _blank);
    } else {
      //TODO: Download image content
    }
  }

  copy(): void {
    if (!this.rippleDisabled && this.canInteract) {
      if (this.image.source) {
        this.clipboard.set(this.image.source).then(() =>
          this.hashy.show('COPIED_URL_TO_CLIPBOARD', 600)
        );
      } else {
        //TODO: Copy image content to clipboard
      }
    }
  }

  edit(): void {
    const image = {...this.image};
    this.dialog.open(EditImageDialogComponent, {
      width: 'var(--width-edit-dialog)',
      data: image,
      disableClose: true,
      autoFocus: false,
    }).afterClosed().subscribe((editedImage: Image) => {
      if (editedImage) {
        const imageContent = this.storageService.fetchImage(this.image.id);
        this.dataService.deleteImage(this.image, true);
        this.dataService.addImage(editedImage, imageContent ?? undefined);
        this.cdr.markForCheck();
      }
    });
  }

  delete(): void {
    this.dataService.deleteImage(this.image);
    this.rippleDisabled = false;
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
