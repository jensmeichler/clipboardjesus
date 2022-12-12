import {CdkDragDrop, moveItemInArray, transferArrayItem} from "@angular/cdk/drag-drop";
import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {MatMenuTrigger} from "@angular/material/menu";
import {DraggableNote, Note, TaskItem, TaskList} from "@clipboardjesus/models";
import {DataService, StringParserService} from "@clipboardjesus/services";
import {EditTaskListDialogComponent} from "@clipboardjesus/components";

@Component({
  selector: 'cb-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent implements OnInit {
  @Input() taskList!: TaskList;

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
  ) {}

  ngOnInit(): void {
    if (!this.taskList) {
      throw new Error('TaskListComponent.taskList input is necessary!');
    }
  }

  get canInteract(): boolean {
    return this.movedPx < 5;
  }

  select(): void {
    this.taskList.selected = !this.taskList.selected;
  }

  onMouseDown(event: MouseEvent): void {
    if (event.button !== 2) {
      this.mouseDown = true;
    }
  }

  onMouseMove(): void {
    if (this.mouseDown) {
      this.movedPx++;
    } else {
      this.movedPx = 0;
    }
  }

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

  addItem(): void {
    if (this.canInteract) {
      let newItem = new TaskItem('');
      this.taskList.items.push(newItem);
      this.itemToEdit = newItem;

      this.dataService.cacheData();
    }
  }

  addItemAfter(parent: TaskItem): void {
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

  edit(): void {
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

  delete(): void {
    if (!this.canInteract) return;
    this.dataService.deleteTaskList(this.taskList);
  }

  startEditItem(item: TaskItem): void {
    if (!this.canInteract) return;
    this.itemToEdit = item;
  }

  endEditItem(item: TaskItem): void {
    const index = this.taskList.items.indexOf(item);
    this.taskList.items[index] = item;
    this.itemToEdit = undefined;
    if (!item.value) this.deleteItem(item);

    this.dataService.cacheData();
  }

  toggleSubTask(item: TaskItem): void {
    if (!this.canInteract) return;
    item.isSubTask = !item.isSubTask;
    this.dataService.cacheData();
  }

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

  deleteItem(item: TaskItem): void {
    if (!this.canInteract) return;
    this.taskList.items = this.taskList.items.filter(x => x !== item);
    this.dataService.cacheData();
  }

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

  moveToTab(index: number): void {
    this.dataService.moveTaskListToTab(index, this.taskList);
  }

  copyColorFrom(item: Note | TaskList): void {
    this.taskList.backgroundColor = item.backgroundColor;
    this.taskList.backgroundColorGradient = item.backgroundColorGradient;
    this.taskList.foregroundColor = item.foregroundColor;
    this.dataService.cacheData();
  }

  connectTo(item: DraggableNote | undefined): void {
    this.taskList.connectedTo = item?.id;
    this.dataService.cacheData();
  }

  showContextMenu(event: MouseEvent): void {
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
