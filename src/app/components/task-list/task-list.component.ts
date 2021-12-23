import {Component, Input, ViewChild} from '@angular/core';
import {TaskItem, TaskList} from "../../models";
import {MatDialog} from "@angular/material/dialog";
import {EditTaskListDialogComponent} from "../dialogs/edit-task-list-dialog/edit-task-list-dialog.component";
import {CdkDragDrop, moveItemInArray, transferArrayItem} from "@angular/cdk/drag-drop";
import {DataService} from "../../services/data.service";
import {MatMenuTrigger} from "@angular/material/menu";

@Component({
  selector: 'task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css']
})
export class TaskListComponent {
  @Input()
  taskList: TaskList = {} as TaskList;

  itemToEdit?: TaskItem;
  selected = false;

  constructor(
    private readonly dialog: MatDialog,
    public readonly dataService: DataService) {
  }

  select() {
    this.selected = !this.selected;
    this.dataService.selectTaskList(this.taskList, this.selected);
  }

  click(event: any) {
    switch (event.button) {
      case 0:
        break;
      case 1:
        this.delete();
        break;
      case 2:
        break;
    }
    event.stopPropagation();
  }

  addItem() {
    let newItem = new TaskItem('');
    this.taskList.items.push(newItem);
    this.itemToEdit = newItem;
  }

  addItemAfter(parent: TaskItem) {
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

  edit() {
    this.dialog.open(EditTaskListDialogComponent, {
      width: 'var(--width-edit-dialog)',
      data: this.taskList,
    });
  }

  delete() {
    this.dataService.deleteTaskList(this.taskList);
  }

  startEditItem(item: TaskItem) {
    this.itemToEdit = item;
  }

  endEditItem(item: TaskItem) {
    let index = this.taskList.items.indexOf(item);
    this.taskList.items[index] = item;
    this.itemToEdit = undefined;
  }

  markAsChecked(item: TaskItem) {
    item.checked = !item.checked;
    let index = this.taskList.items.indexOf(item);
    this.taskList.items[index] = item;
  }

  deleteItem(item: TaskItem) {
    this.taskList.items = this.taskList.items.filter(x => x !== item);
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
  }

  @ViewChild(MatMenuTrigger)
  contextMenu!: MatMenuTrigger;
  rightClickPosX = 0;
  rightClickPosY = 0;

  showContextMenu(event: any) {
    event.preventDefault();
    this.rightClickPosX = event.clientX;
    this.rightClickPosY = event.clientY;
    this.contextMenu.openMenu();
    event.stopPropagation();
  }
}
