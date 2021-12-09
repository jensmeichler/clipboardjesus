import {Component, Inject} from '@angular/core';
import {MatChipInputEvent} from "@angular/material/chips";
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import {TaskList} from "../../../models";

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
      this.data.items.push(item);
    }

    event.chipInput!.clear();
  }

  removeItem(item: string): void {
    const index = this.data.items.indexOf(item);
    if (index >= 0) {
      this.data.items.splice(index, 1);
    }
  }
}
