import {ChangeDetectionStrategy, Component, HostListener, Inject} from '@angular/core';
import {MatChipInputEvent} from "@angular/material/chips";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {TaskItem, TaskList} from "@clipboardjesus/models";

/**
 * Dialog component for the edit-dialog of a task list.
 */
@Component({
  selector: 'cb-edit-task-list-dialog',
  templateUrl: './edit-task-list-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditTaskListDialogComponent {
  /**
   * Create an instance of the dialog.
   * @param dialogRef The reference to the material dialog.
   * @param data The task list to edit.
   */
  constructor(
    protected readonly dialogRef: MatDialogRef<EditTaskListDialogComponent>,
    @Inject(MAT_DIALOG_DATA) protected data: TaskList,
  ) {}

  /**
   * Add a task to the list, when user hits [Enter] into the input field.
   */
  addItem(event: MatChipInputEvent): void {
    const item = (event.value || '').trim();

    if (item) {
      let newListItem = new TaskItem(item);
      this.data.items.push(newListItem);
    }

    event.chipInput!.clear();
  }

  /**
   * Remove the task from the task list.
   */
  removeItem(item: TaskItem): void {
    const index = this.data.items.indexOf(item);
    if (index >= 0) {
      this.data.items.splice(index, 1);
    }
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
    if (!this.data.header?.trim()) {
      this.data.header = undefined;
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
