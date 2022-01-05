import {CdkDragDrop, moveItemInArray, transferArrayItem} from "@angular/cdk/drag-drop";
import {Component, Input, OnDestroy, ViewChild} from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {MatMenuTrigger} from "@angular/material/menu";
import {Subscription} from "rxjs";
import {TaskItem, TaskList} from "../../models";
import {DataService} from "../../services/data.service";
import {StringParserService} from "../../services/string-parser.service";
import {EditTaskListDialogComponent} from "../dialogs/edit-task-list-dialog/edit-task-list-dialog.component";

@Component({
  selector: 'task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css']
})
export class TaskListComponent implements OnDestroy {
  @Input()
  taskList: TaskList = {} as TaskList;

  dialogSubscription?: Subscription;

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

  ngOnDestroy() {
    this.dialogSubscription?.unsubscribe();
  }

  select() {
    this.taskList.selected = !this.taskList.selected;
    this.dataService.onSelectionChange(this.taskList);
  }

  click(event: any) {
    switch (event.button) {
      case 0:
        if (event.ctrlKey || event.shiftKey) {
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

  addItem() {
    let newItem = new TaskItem('');
    this.taskList.items.push(newItem);
    this.itemToEdit = newItem;

    this.dataService.cacheData();
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
    let taskList = JSON.parse(JSON.stringify(this.taskList));
    this.dialogSubscription = this.dialog.open(EditTaskListDialogComponent, {
      width: 'var(--width-edit-dialog)',
      data: taskList,
    }).afterClosed().subscribe((editedTaskList) => {
      if (editedTaskList) {
        this.taskList = editedTaskList;
        this.dataService.cacheData();
      }
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

    this.dataService.cacheData();
  }

  markAsChecked(item: TaskItem) {
    item.checked = !item.checked;
    let index = this.taskList.items.indexOf(item);
    this.taskList.items[index] = item;
    this.dataService.cacheData();
  }

  toggleSubTask(item: TaskItem) {
    item.isSubTask = !item.isSubTask;
    this.dataService.cacheData();
  }

  onKeyPressed(event: KeyboardEvent, item: TaskItem) {
    if (event.key == 'Enter') {
      this.endEditItem(item);
    } else if (event.key == 'Tab') {
      this.toggleSubTask(item);
      event.stopPropagation();
      event.preventDefault();
    }
  }

  deleteItem(item: TaskItem) {
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

  showContextMenu(event: any) {
    event.preventDefault();
    this.rightClickPosX = event.clientX;
    this.rightClickPosY = event.clientY;
    this.contextMenu.openMenu();
    event.stopPropagation();
  }
}
