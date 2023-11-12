import {CdkDragDrop, moveItemInArray, transferArrayItem} from "@angular/cdk/drag-drop";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input
} from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {Colored, DraggableNote, TaskItem, TaskList} from "@clipboardjesus/models";
import {DataService, StringParserService} from "@clipboardjesus/services";
import {DraggableComponent, EditTaskListDialogComponent} from "@clipboardjesus/components";
import {DisplayValue} from "@clipboardjesus/helpers";

/**
 * The component which contains tasks.
 */
@Component({
  selector: 'cb-task-list[taskList]',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskListComponent extends DraggableComponent {
  /** The task list itself. */
  @Input() taskList!: TaskList;
  /** The event that fires when this component should be rendered again. */
  @Input() changed?: EventEmitter<void>;

  /** The item of the task list that is currently being edited. */
  itemToEdit?: TaskItem;

  /** Static methods to create the display value to use in the markup. */
  DisplayValue = DisplayValue;

  /**
   * Creates a new task list.
   */
  constructor(
    /** Reference to the material dialog. */
    private readonly dialog: MatDialog,
    /** Reference to the data service. */
    protected readonly dataService: DataService,
    /** Reference to the string parser service. */
    protected readonly stringParser: StringParserService,
    /** Reference to the change detector. */
    private readonly cdr: ChangeDetectorRef,
  ) {
    super();
  }

  /**
   * TODO: get rid of this method and use the one in the base class.
   */
  select(): void {
    this.taskList.selected = !this.taskList.selected;
    this.changed?.emit();
  }

  /**
   * Handles the click onto the task list.
   * @param event
   */
  onMouseUp(event: MouseEvent): void {
    if (this.mouseDown && this.canInteract) {
      switch (event.button) {
        case 0:
          if (event.ctrlKey || event.metaKey || event.shiftKey) {
            this.select();
          }
          break;
        case 1:
          this.delete();
          break;
        case 2:
          break;
      }

      event.stopPropagation();
    }

    this.mouseDown = false;
  }

  /**
   * Adds a new item to the task list and puts that into edit mode.
   */
  addItem(): void {
    if (this.canInteract) {
      let newItem = new TaskItem('');
      this.taskList.items.push(newItem);
      this.itemToEdit = newItem;

      this.cdr.markForCheck();
      this.dataService.cacheData();
    }
  }

  /**
   * Adds a new item to the task list after the given item and puts that into edit mode.
   * @param parent
   */
  addItemAfter(parent: TaskItem): void {
    if (!this.canInteract) {
      return;
    }

    let newItem = new TaskItem('');
    newItem.isSubTask = parent.isSubTask;
    transferArrayItem(
      [newItem],
      this.taskList.items,
      0,
      this.taskList.items.indexOf(parent) + 1,
    );
    this.itemToEdit = newItem;
    this.cdr.markForCheck();
  }

  /**
   * Opens the edit dialog for the task list.
   */
  edit(): void {
    if (!this.canInteract) {
      return;
    }
    let taskList = JSON.parse(JSON.stringify(this.taskList));
    this.dialog.open(EditTaskListDialogComponent, {
      width: 'var(--width-edit-dialog)',
      data: taskList,
      disableClose: true,
    }).afterClosed().subscribe((editedTaskList: TaskList) => {
      if (editedTaskList) {
        this.dataService.deleteTaskList(this.taskList, true);
        this.dataService.addTaskList(editedTaskList);
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * TODO: get rid of this method and use the one in the base class.
   */
  delete(): void {
    if (!this.canInteract) {
      return;
    }
    this.dataService.deleteTaskList(this.taskList);
  }

  /**
   * Sets the given item as the item to edit.
   * @param item
   */
  startEditItem(item: TaskItem): void {
    if (!this.canInteract) {
      return;
    }
    this.itemToEdit = item;
    this.cdr.markForCheck();
  }

  /**
   * Saves the edited item and closes the edit mode.
   * @param item
   */
  endEditItem(item: TaskItem): void {
    const index = this.taskList.items.indexOf(item);
    this.taskList.items[index] = item;
    this.itemToEdit = undefined;
    if (!item.value) {
      this.deleteItem(item);
    }

    this.cdr.markForCheck();
    this.dataService.cacheData();
  }

  /**
   * Converts the given item into a subtask when it isn't.
   * Otherwise, it converts it into a normal task.
   * @param item
   */
  toggleSubTask(item: TaskItem): void {
    if (!this.canInteract) {
      return;
    }
    item.isSubTask = !item.isSubTask;
    this.cdr.markForCheck();
    this.dataService.cacheData();
  }

  /**
   * Handles the key press event on the item.
   * @param event
   * @param item
   */
  onKeyPressed(event: KeyboardEvent, item: TaskItem): void {
    if (event.key === 'Enter') {
      if (item.value) {
        this.endEditItem(item);
        this.addItemAfter(item);
      } else {
        this.deleteItem(item);
      }
    } else if (event.key === 'Escape') {
      if (item.value) {
        this.endEditItem(item);
      } else {
        this.deleteItem(item);
      }
    } else if (event.key === 'Tab') {
      this.toggleSubTask(item);
      event.preventDefault();
    }
    event.stopPropagation();
  }

  /**
   * Deletes the given item from the task list.
   * @param item
   */
  deleteItem(item: TaskItem): void {
    if (!this.canInteract) {
      return;
    }
    this.taskList.items = this.taskList.items.filter(x => x !== item);
    this.cdr.markForCheck();
    this.dataService.cacheData();
  }

  /**
   * Handles the drop event on the task list.
   * @param event
   */
  dropItem(event: CdkDragDrop<TaskItem[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(this.taskList.items, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        this.taskList.items,
        event.previousIndex,
        event.currentIndex,
      );
    }

    this.dataService.cacheData();
  }

  /**
   * TODO: get rid of this method and use the one in the base class.
   */
  moveToTab(index: number): void {
    this.dataService.moveTaskListToTab(index, this.taskList);
    this.cdr.markForCheck();
  }

  /**
   * Copy the color from the given item.
   * @param item
   */
  copyColorFrom(item: Colored): void {
    this.taskList.backgroundColor = item.backgroundColor;
    this.taskList.backgroundColorGradient = item.backgroundColorGradient;
    this.taskList.foregroundColor = item.foregroundColor;
    this.cdr.markForCheck();
    this.dataService.cacheData();
  }

  /**
   * TODO: get rid of this method and use the one in the base class.
   */
  connectTo(item: DraggableNote | undefined): void {
    if (item === undefined) {
      this.dataService.disconnectAll(this.taskList);
    } else {
      this.dataService.connect(this.taskList, item);
    }
    this.changed?.emit();
    this.dataService.cacheData();
  }
}
