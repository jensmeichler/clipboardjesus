import {ChangeDetectionStrategy, Component, HostListener, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Tab} from "@clipboardjesus/models";
import {DataService} from "@clipboardjesus/services";

/**
 * Dialog component for the edit-dialog of a tab.
 */
@Component({
  selector: 'cb-edit-tab-dialog',
  templateUrl: './edit-tab-dialog.component.html',
  styleUrls: ['./edit-tab-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditTabDialogComponent {
  /** Purple color that matches the theme. */
  purple = '#7b1ea2';
  /** Green color that matches the theme. */
  green = '#69f0ae';
  /** Default color that matches the theme. */
  reset = '#131313';

  /** The tab to be edited. */
  tab: Tab;
  /** The method to update the view. */
  changeFn: () => void;

  /**
   * Create an instance of the dialog.
   */
  constructor(
    /** The reference to the material dialog. */
    public readonly dialogRef: MatDialogRef<EditTabDialogComponent>,
    /** The tab to edit and the function to update the view. */
    @Inject(MAT_DIALOG_DATA) public data: { tab: Tab, changeFn: () => void },
    /** Reference to the data service. */
    public readonly dataService: DataService,
  ) {
    this.tab = data.tab;
    this.changeFn = data.changeFn;
  }

  /**
   * Changes the background color of the tab.
   */
  changeColorTo(color: string): void {
    this.tab.color = color;
    this.changeFn();
  }

  /**
   * Move the tab on position to the right.
   */
  moveToRight(): void {
    this.reArrangeTab(this.dataService.selectedTabIndex + 1);
  }

  /**
   * Move the tab on position to the left.
   */
  moveToLeft(): void {
    this.reArrangeTab(this.dataService.selectedTabIndex - 1);
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
   * Confirm the dialog.
   */
  submit(): void {
    this.dialogRef.close(this.data);
  }

  /**
   * Close the dialog.
   */
  cancel(): void {
    this.dialogRef.close(false);
  }

  /**
   * Move the tab to the given {@param targetIndex}.
   */
  private reArrangeTab(targetIndex: number): void {
    const sourceIndex = this.dataService.selectedTabIndex;
    this.dataService.reArrangeTab(sourceIndex, targetIndex);
    this.dataService.selectedTabIndex = targetIndex;
  }
}
