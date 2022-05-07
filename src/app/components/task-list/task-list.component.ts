import {CdkDragDrop, moveItemInArray, transferArrayItem} from "@angular/cdk/drag-drop";
import {Component, Input, ViewChild} from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {MatMenuTrigger} from "@angular/material/menu";
import {Note, TaskItem, TaskList} from "../../models";
import {DataService, StringParserService} from "../../services";
import {EditTaskListDialogComponent} from "../dialogs";

@Component({
  selector: 'task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent {
  @Input() taskList: TaskList = {} as TaskList;

  mouseDown = false;
  movedPx = 0;

  itemToEdit?: TaskItem;

  @ViewChild(MatMenuTrigger)
  contextMenu!: MatMenuTrigger;
  rightClickPosX = 0;
  rightClickPosY = 0;

  constructor(
    private readonly dialog: MatDialog,
    public readonly dataService: DataService,
    public readonly stringParser: StringParserService
  ) {
  }

  get canInteract() {
    return this.movedPx < 5;
  }

  select() {
    this.taskList.selected = !this.taskList.selected;
  }

  onMouseDown(event: MouseEvent) {
    if (event.button !== 2) {
      this.mouseDown = true;
    }
  }

  onMouseMove() {
    if (this.mouseDown) {
      this.movedPx++;
    } else {
      this.movedPx = 0;
    }
  }

  onMouseUp(event: MouseEvent) {
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

  addItem() {
    if (this.canInteract) {
      let newItem = new TaskItem('');
      this.taskList.items.push(newItem);
      this.itemToEdit = newItem;

      this.dataService.cacheData();
    }
  }

  addItemAfter(parent: TaskItem) {
    if (this.canInteract) {
      let newItem = new TaskItem('');
      newItem.isSubTask = parent.isSubTask;

      transferArrayItem(
        [newItem],
        this.taskList.items,
        0,
        this.taskList.items.indexOf(parent) + 1,
      );

      this.itemToEdit = newItem;
    }
  }

  edit() {
    if (this.canInteract) {
      let taskList = JSON.parse(JSON.stringify(this.taskList));
      this.dialog.open(EditTaskListDialogComponent, {
        width: 'var(--width-edit-dialog)',
        data: taskList,
        disableClose: true,
      }).afterClosed().subscribe((editedTaskList: TaskList) => {
        if (editedTaskList) {
          this.dataService.deleteTaskList(this.taskList, true);
          this.dataService.addTaskList(editedTaskList);
        }
      });
    }
  }

  delete() {
    if (!this.canInteract) return;
    this.dataService.deleteTaskList(this.taskList);
  }

  startEditItem(item: TaskItem) {
    if (!this.canInteract) return;
    this.itemToEdit = item;
  }

  endEditItem(item: TaskItem) {
    const index = this.taskList.items.indexOf(item);
    this.taskList.items[index] = item;
    this.itemToEdit = undefined;

    this.dataService.cacheData();
  }

  toggleSubTask(item: TaskItem) {
    if (!this.canInteract) return;
    item.isSubTask = !item.isSubTask;
    this.dataService.cacheData();
  }

  onKeyPressed(event: KeyboardEvent, item: TaskItem) {
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

  deleteItem(item: TaskItem) {
    if (!this.canInteract) return;
    this.taskList.items = this.taskList.items.filter(x => x !== item);
    this.dataService.cacheData();
  }

  dropItem(event: CdkDragDrop<TaskItem[]>) {
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

  moveToTab(index: number) {
    this.dataService.moveTaskListToTab(index, this.taskList);
  }

  copyColorFrom(item: Note | TaskList) {
    this.taskList.backgroundColor = item.backgroundColor;
    this.taskList.backgroundColorGradient = item.backgroundColorGradient;
    this.taskList.foregroundColor = item.foregroundColor;
    this.dataService.cacheData();
  }

  showContextMenu(event: MouseEvent) {
    if (this.canInteract) {
      event.preventDefault();
      event.stopPropagation();

      this.rightClickPosX = event.clientX;
      this.rightClickPosY = event.clientY;
      this.contextMenu.openMenu();
    }
    this.mouseDown = false;
  }
}
