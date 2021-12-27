import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import {Tab} from "../../../models";

@Component({
  selector: 'app-edit-tab-dialog',
  templateUrl: './edit-tab-dialog.component.html'
})
export class EditTabDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Tab,
  ) {
  }
}
