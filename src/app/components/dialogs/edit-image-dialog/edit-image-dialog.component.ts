import {ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Image} from "@clipboardjesus/models";
import {StorageService} from "@clipboardjesus/services";
import {getMatIconFromFileType, toBase64} from "@clipboardjesus/helpers";

/**
 * Dialog component for the edit-dialog of an image.
 */
@Component({
  selector: 'cb-edit-image-dialog',
  templateUrl: './edit-image-dialog.component.html',
  styleUrls: ['./edit-image-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditImageDialogComponent {
  /** The content of the file from the localStorage. */
  uploaded: string | null;
  /** Whether the image is loaded successfully. */
  loadedFromUrl = false;

  /**
   * The file type of the uploaded image.
   * @returns null when image is not stored locally.
   */
  get fileType(): string | null {
    return this.uploaded?.split(';')[0].replace('data:', '') ?? null;
  }

  /**
   * Information whether the image stored in the localStorage can be shown.
   */
  get showPreview(): boolean {
    return !!this.fileType?.startsWith('image/');
  }

  /**
   * Get the icon to display when the file cannot be displayed.
   */
  get matIcon(): string {
    return getMatIconFromFileType(this.fileType);
  }

  /**
   * Create an instance of the dialog.
   * @param dialogRef The reference to the material dialog.
   * @param data The image to edit.
   * @param storageService The reference to the storage service to save the image locally.
   * @param cdr The reference to the ChangeDetector for updating the view.
   */
  constructor(
    protected readonly dialogRef: MatDialogRef<EditImageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) protected data: Image,
    private readonly storageService: StorageService,
    private readonly cdr: ChangeDetectorRef,
  ) {
    this.uploaded = this.storageService.fetchImage(this.data.id);
  }

  /**
   * Confirm the dialog when the user pressed enter.
   * Close the dialog when the user pressed escape.
   */
  @HostListener('keydown', ['$event'])
  onKeyPressed(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      this.submit();
    } else if (event.key === 'Escape') {
      this.cancel();
    }

    event.stopPropagation();
  }

  /**
   * Method that is called from the view on load.
   */
  onUrlLoaded(): void {
    this.loadedFromUrl = true;
    this.cdr.markForCheck();
  }

  /**
   * Delete the uploaded image.
   */
  removeImage(): void {
    this.uploaded = null;
    this.cdr.markForCheck();
  }

  /**
   * Select a file from the file system.
   */
  async openFileDialog(): Promise<void> {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.addEventListener('change', (e: Event) => this.addFile(e));
    input.click();
  }

  /**
   * Add the file as base64 and show it as a preview.
   */
  private async addFile(event: Event): Promise<void> {
    const file = (event as any).target.files[0] as File;
    if (!file) {
      return;
    }

    this.uploaded = await toBase64(file);
    this.cdr.markForCheck();
  }

  /**
   * Confirm the dialog.
   */
  submit(): void {
    if (this.uploaded) {
      this.data.source = null;
      this.storageService.storeImage(this.data.id, this.uploaded);
    } else {
      this.storageService.deleteImage(this.data.id);
    }
    this.dialogRef.close(this.data);
  }

  /**
   * Close the dialog.
   */
  cancel(): void {
    this.dialogRef.close(false);
  }
}
