import {ChangeDetectionStrategy, Component, HostListener, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Tab} from "@clipboardjesus/models";
import {DataService} from "@clipboardjesus/services";

@Component({
  selector: 'cb-edit-tab-dialog',
  templateUrl: './edit-tab-dialog.component.html',
  styleUrls: ['./edit-tab-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditTabDialogComponent {
  purple = '#7b1ea2';
  green = '#69f0ae';
  reset = '#131313';

  tab: Tab;
  changeFn: () => void;

  constructor(
    public dialogRef: MatDialogRef<EditTabDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { tab: Tab, changeFn: () => void },
    public readonly dataService: DataService,
  ) {
    this.tab = data.tab;
    this.changeFn = data.changeFn;
  }

  changeColorTo(color: string): void {
    this.tab.color = color;
    this.changeFn();
  }

  moveToRight(): void {
    this.reArrangeTab(this.dataService.selectedTabIndex + 1);
  }

  moveToLeft(): void {
    this.reArrangeTab(this.dataService.selectedTabIndex - 1);
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

  submit(): void {
    this.dialogRef.close(this.data);
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  private reArrangeTab(targetIndex: number): void {
    const sourceIndex = this.dataService.selectedTabIndex;
    this.dataService.reArrangeTab(sourceIndex, targetIndex);
    this.dataService.selectedTabIndex = targetIndex;
  }
}
