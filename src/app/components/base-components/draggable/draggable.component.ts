import {Component, ViewChild} from '@angular/core';
import {MatMenuTrigger} from "@angular/material/menu";

/**
 * Base component for draggable items.
 */
@Component({
  selector: 'cb-draggable',
  template: '',
  styleUrls: ['./draggable.component.css']
})
export class DraggableComponent {
  /** The context menu binding. */
  @ViewChild(MatMenuTrigger)
  contextMenu!: MatMenuTrigger;
  /** The x position for the context menu. */
  rightClickPosX = 0;
  /** The y position for the context menu. */
  rightClickPosY = 0;

  /** Whether the ripple effect is enabled or not. */
  rippleDisabled = false;
  /** Whether the mouse button is currently clicked. */
  mouseDown = false;
  /** The delta which the mouse is moved while mouse down. */
  movedPx = 0;

  /**
   * Whether the user not dragged the item.
   * When the user dragged the item more than 5px he did not want to trigger the button he clicked.
   * That's what this method should be used for.
   */
  get canInteract(): boolean {
    return this.movedPx < 5;
  }

  /**
   * On mouse down this method should be called
   * to have correct values for the {@link canInteract} function
   */
  onMouseDown(event: MouseEvent): void {
    if (event.button !== 2) {
      this.mouseDown = true;
    }
  }

  /**
   * On mouse move this method should be called
   * to have correct values for the {@link canInteract} function
   */
  onMouseMove(): void {
    if (this.mouseDown) {
      this.movedPx++;
    } else {
      this.movedPx = 0;
    }
  }

  /**
   * Trigger the context menu at the current mouse position.
   * Triggers just, when {@link canInteract} returns true.
   */
  showContextMenu(event: MouseEvent): void {
    if (this.canInteract) {
      event.preventDefault();
      event.stopPropagation();

      this.rightClickPosX = event.clientX;
      this.rightClickPosY = event.clientY;
      this.contextMenu.openMenu();
    }
    this.rippleDisabled = false;
    this.mouseDown = false;
  }
}
