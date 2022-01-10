import {Component, HostListener} from '@angular/core';

@Component({
  selector: 'app-about-dialog',
  templateUrl: './about-dialog.component.html',
  styleUrls: ['./about-dialog.component.css']
})
export class AboutDialogComponent {
  @HostListener('keydown', ['$event'])
  onKeyPressed(event: KeyboardEvent) {
    event.stopPropagation();
  }
}
