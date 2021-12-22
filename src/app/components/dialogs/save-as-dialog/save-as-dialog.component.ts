import {Component} from '@angular/core';

@Component({
  selector: 'save-as-dialog',
  templateUrl: './save-as-dialog.component.html'
})
export class SaveAsDialogComponent {
  filename: string = '';

  constructor() {
  }
}
