import {ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Image} from "@clipboardjesus/models";
import {StorageService} from "@clipboardjesus/services";
import {getMatIconFromFileType, toBase64} from "@clipboardjesus/helpers";

@Component({
  selector: 'cb-edit-image-dialog',
  templateUrl: './edit-image-dialog.component.html',
  styleUrls: ['./edit-image-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditImageDialogComponent {
  uploaded: string | null;
  loadedFromUrl = false;

  get fileType(): string | null {
    return this.uploaded?.split(';')[0].replace('data:', '') ?? null;
  }

  get showPreview(): boolean {
    return !!this.fileType?.startsWith('image/');
  }

  get matIcon(): string {
    return getMatIconFromFileType(this.fileType);
  }

  constructor(
    public dialogRef: MatDialogRef<EditImageDialogComponent>,
    private readonly storageService: StorageService,
    @Inject(MAT_DIALOG_DATA) public data: Image,
    private readonly cdr: ChangeDetectorRef,
  ) {
    this.uploaded = this.storageService.fetchImage(this.data.id);
  }

  @HostListener('keydown', ['$event'])
  onKeyPressed(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      this.submit();
    } else if (event.key === 'Escape') {
      this.cancel();
    }

    event.stopPropagation();
  }

  onUrlLoaded(): void {
    this.loadedFromUrl = true;
    this.cdr.markForCheck();
  }

  removeImage(): void {
    this.uploaded = null;
    this.cdr.markForCheck();
  }

  async openFileDialog(): Promise<void> {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.addEventListener('change', (e: Event) => this.addFile(e));
    input.click();
  }

  private async addFile(event: Event): Promise<void> {
    const file = (event as any).target.files[0] as File;
    if (!file) {
      return;
    }

    this.uploaded = await toBase64(file);
    this.cdr.markForCheck();
  }

  submit(): void {
    if (this.uploaded) {
      this.data.source = null;
      this.storageService.storeImage(this.data.id, this.uploaded);
    } else {
      this.storageService.deleteImage(this.data.id);
    }
    this.dialogRef.close(this.data);
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
