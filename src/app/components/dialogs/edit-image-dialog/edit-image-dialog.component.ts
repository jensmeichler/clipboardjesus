import {Component, HostListener, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Image} from "@clipboardjesus/models";

@Component({
  selector: 'cb-edit-image-dialog',
  templateUrl: './edit-image-dialog.component.html',
  styleUrls: ['./edit-image-dialog.component.css']
})
export class EditImageDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<EditImageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Image,
  ) {}

  @HostListener('keydown', ['$event'])
  onKeyPressed(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      this.submit();
    } else if (event.key === 'Escape') {
      this.cancel();
    }

    event.stopPropagation();
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

    const toBase64 = (file: File): Promise<string> =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (): void => resolve(reader.result as any);
        reader.onerror = (error): void => reject(error);
      });

    const fileBase64 = await toBase64(file);

    localStorage.setItem(this.data.id, fileBase64);
    this.data.source = null;

    this.submit();
  }

  submit(): void {
    this.dialogRef.close(this.data);
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
