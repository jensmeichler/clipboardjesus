import {Component, Inject} from '@angular/core';
import {MatChipInputEvent} from "@angular/material/chips";
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import {TaskList, TaskItem} from "../../../models";

@Component({
  selector: 'app-edit-task-list-dialog',
  templateUrl: './edit-task-list-dialog.component.html'
})
export class EditTaskListDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: TaskList,
  ) {
  }

  addItem(event: MatChipInputEvent): void {
    const item = (event.value || '').trim();

    if (item) {
      let newListItem = new TaskItem(item);
      this.data.items.push(newListItem);
    }

    event.chipInput!.clear();
  }

  removeItem(item: TaskItem): void {
    const index = this.data.items.indexOf(item);
    if (index >= 0) {
      this.data.items.splice(index, 1);
    }
  }
}
