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
  notesCount: string;
  noteListsCount: string;
  taskListsCount: string;
  imagesCount: string;

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
    this.notesCount = dataService.tab.notes?.length.toString() ?? '0';
    this.noteListsCount = dataService.tab.noteLists?.length.toString() ?? '0';
    this.taskListsCount = dataService.tab.taskLists?.length.toString() ?? '0';
    this.imagesCount = dataService.tab.images?.length.toString() ?? '0';
  }

  changeColorTo(color: string): void {
    this.tab.color = color;
    this.changeFn();
  }

  deleteNotes(): void {
    this.notesCount = '0';
    this.dataService.tab.notes = [];
    this.changeFn();
  }

  deleteNoteLists(): void {
    this.noteListsCount = '0';
    this.dataService.tab.noteLists = [];
    this.changeFn();
  }

  deleteTaskLists(): void {
    this.taskListsCount = '0';
    this.dataService.tab.taskLists = [];
    this.changeFn();
  }

  deleteImages(): void {
    this.imagesCount = '0';
    this.dataService.tab.images = [];
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
  }
}
