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
import {_blank, DisplayValue, getMatIconFromFileType} from "@clipboardjesus/helpers";
import {DraggableComponent, EditImageDialogComponent} from "@clipboardjesus/components";
import {take} from "rxjs";

/**
 * The component which contains an image.
 * Source can be either an url or a base64 encoded string.
 */
@Component({
  selector: 'cb-image[image]',
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageComponent extends DraggableComponent implements OnInit {
  /** The image itself. */
  @Input() image!: Image;
  /** The event that fires when this component should be rendered again. */
  @Input() changed?: EventEmitter<void>;

  /** Whether the img source was successfully loaded from the given {@link Image.source} */
  loadedFromUrlSuccess = false;
  /** Whether the img source was successfully loaded from the local storage. */
  loadedFromStorageSuccess = false;
  /** The img source loaded from the local storage. */
  loadedFromStorage: string | false = false;

  /**
   * The icon to use for the image.
   * Will be specific to the file type.
   */
  get matIcon(): string {
    if (!this.loadedFromStorage) {
      return 'image';
    }

    const fileType = this.loadedFromStorage
      .split(';')[0]
      .replace('data:', '');
    return getMatIconFromFileType(fileType);
  }

  /** Static methods to create the display value to use in the markup. */
  DisplayValue = DisplayValue;

  /**
   * Creates a new image.
   */
  constructor(
    /** Reference to the hashy service. */
    private readonly hashy: HashyService,
    /** Reference to the clipboard service. */
    private readonly clipboard: ClipboardService,
    /** Reference to the data service. */
    protected readonly dataService: DataService,
    /** Reference to the material dialog. */
    private readonly dialog: MatDialog,
    /** Reference to the storage service. */
    private readonly storageService: StorageService,
    /** Reference to the change detector. */
    private readonly cdr: ChangeDetectorRef,
  ) {
    super();
  }

  /**
   * Initializes the component.
   * If the image source is null, it will try to load it from the local storage.
   */
  ngOnInit(): void {
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

  /**
   * Sets some properties when the image was successfully loaded from the url.
   * These are then used in the markup to display the image.
   */
  onImageLoadedFromUrl(): void {
    this.loadedFromUrlSuccess = true;
    this.cdr.markForCheck();
  }

  /**
   * Sets some properties when the image was successfully loaded from the url.
   * These are then used in the markup to display the image.
   */
  onImageLoadedFromStorage(): void {
    this.loadedFromStorageSuccess = true;
    this.cdr.markForCheck();
  }

  /**
   * TODO: get rid of this method and use the one in the base class.
   */
  select(): void {
    this.image.selected = !this.image.selected;
    this.changed?.emit();
  }

  /**
   * Handles the click onto the image.
   * @param event
   */
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

  /**
   * Opens the image in a new tab.
   */
  open(): void {
    if (this.image.source) {
      window.open(this.image.source, _blank);
    } else {
      const base64 = this.storageService.fetchImage(this.image.id);
      if (base64) {
        fetch(base64).then((response) => {
          response.blob().then((blob) => {
            const url = URL.createObjectURL(blob);
            window.open(url, _blank);
          });
        });
      }
    }
  }

  /**
   * Copies the image to the clipboard.
   */
  copy(): void {
    if (!this.rippleDisabled && this.canInteract) {
      if (this.image.source) {
        this.clipboard.set(this.image.source).then(() =>
          this.hashy.show('COPIED_URL_TO_CLIPBOARD', 600)
        );
      } else {
        const base64 = this.storageService.fetchImage(this.image.id);
        if (base64) {
          this.clipboard.setFile(base64).then((success) => {
            if (success) {
              this.hashy.show('COPIED_TO_CLIPBOARD', 600)
            } else {
              this.open();
            }
          });
        }
      }
    }
  }

  /**
   * Opens the edit dialog.
   */
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

  /**
   * TODO: get rid of this method and use the one in the base class.
   */
  delete(): void {
    this.dataService.deleteImage(this.image);
    this.rippleDisabled = false;
  }

  /**
   * TODO: get rid of this method and use the one in the base class.
   */
  moveToTab(index: number): void {
    this.dataService.moveImageToTab(index, this.image);
    this.cdr.markForCheck();
  }

  /**
   * TODO: get rid of this method and use the one in the base class.
   */
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
