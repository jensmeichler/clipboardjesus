import {CdkDragDrop, moveItemInArray, transferArrayItem} from "@angular/cdk/drag-drop";
import {Component, HostListener, Input, OnDestroy, ViewChild} from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {MatMenuTrigger} from "@angular/material/menu";
import {Subscription} from "rxjs";
import {Note, TaskItem, TaskList} from "../../models";
import {DataService} from "../../services/data.service";
import {StringParserService} from "../../services/string-parser.service";
import {EditTaskListDialogComponent} from "../dialogs/edit-task-list-dialog/edit-task-list-dialog.component";

@Component({
  selector: 'task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent implements OnDestroy {
  @Input()
  taskList: TaskList = {} as TaskList;

  dialogSubscription?: Subscription;

  mouseDown = false;
  movedPx = 0;

  showRadEffect = false;
  radEffectWidth = 0;
  mousePosX = 0;
  mousePosY = 0;

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

  @HostListener('mouseenter')
  onMouseEnter() {
    this.showRadEffect = true;
    this.radEffectWidth = 0;
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.showRadEffect = false;
  }

  ngOnDestroy() {
    this.dialogSubscription?.unsubscribe();
  }

  select() {
    this.taskList.selected = !this.taskList.selected;
  }

  onMouseDown(event: MouseEvent) {
    if (event.button != 2) {
      this.mouseDown = true;
    }
  }

  onMouseMove(event: MouseEvent) {
    if (this.mouseDown) {
      this.movedPx++;
    } else {
      this.movedPx = 0;

      // Hack for rad effect
      this.mousePosX = event.pageX - this.taskList.posX;
      this.mousePosY = event.pageY - this.taskList.posY;
    }

    if (this.radEffectWidth < 80) {
      this.radEffectWidth += (Math.abs(event.movementX) + Math.abs(event.movementY)) * 2;
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
      this.dialogSubscription = this.dialog.open(EditTaskListDialogComponent, {
        width: 'var(--width-edit-dialog)',
        data: taskList,
        disableClose: true,
      }).afterClosed().subscribe((editedTaskList) => {
        if (editedTaskList) {
          this.dataService.deleteTaskList(this.taskList, true);
          this.dataService.addTaskList(editedTaskList);
        }
      });
    }
  }

  delete() {
    if (this.canInteract) {
      this.dataService.deleteTaskList(this.taskList);
    }
  }

  startEditItem(item: TaskItem) {
    if (this.canInteract) {
      this.itemToEdit = item;
    }
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
    if (this.canInteract) {
      item.isSubTask = !item.isSubTask;
      this.dataService.cacheData();
    }
  }

  onKeyPressed(event: KeyboardEvent, item: TaskItem) {
    if (event.key == 'Enter' || event.key == 'Escape') {
      this.endEditItem(item);
    } else if (event.key == 'Tab') {
      this.toggleSubTask(item);
      event.preventDefault();
    }
    event.stopPropagation();
  }

  deleteItem(item: TaskItem) {
    if (this.canInteract) {
      this.taskList.items = this.taskList.items.filter(x => x !== item);
      this.dataService.cacheData();
    }
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
