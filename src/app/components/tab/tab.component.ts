import {Component, Input} from '@angular/core';
import {Image, Note, Tab} from "../../models";
import {DataService} from "../../services/data.service";
import {HashyService} from "../../services/hashy.service";

@Component({
  selector: 'clipboard-tab',
  templateUrl: './tab.component.html',
  styleUrls: ['./tab.component.css']
})
export class TabComponent {
  @Input()
  tab?: Tab;

  startCursorPosX = 0;
  startCursorPosY = 0;
  endCursorPosX = 0;
  endCursorPosY = 0;
  mouseDown = false;
  mouseMoveFailure = false;

  constructor(
    private readonly hashy: HashyService,
    public readonly dataService: DataService) {
  }

  private resetCursors() {
    this.startCursorPosX = 0;
    this.startCursorPosY = 0;
    this.endCursorPosX = 0;
    this.endCursorPosY = 0;
    this.mouseDown = false;
  }

  onMouseDown(event: MouseEvent) {
    if (!this.mouseDown) {
      this.mouseDown = true;
      this.startCursorPosX = event.pageX;
      this.startCursorPosY = event.pageY;
      this.endCursorPosX = event.pageX;
      this.endCursorPosY = event.pageY;
      console.log(this.startCursorPosX, this.startCursorPosY)
    } else {
      this.mouseMoveFailure = true;
    }
  }

  onMouseMove(event: MouseEvent) {
    if (this.mouseDown) {
      this.endCursorPosX = event.pageX;
      this.endCursorPosY = event.pageY;
    }
  }

  onMouseUp(event: MouseEvent) {
    if (this.mouseMoveFailure) {
      this.mouseMoveFailure = false;
      this.resetCursors();
      return;
    }

    const cursorMoved = Math.abs(event.pageX - this.startCursorPosX) > 5
      || Math.abs(event.pageY - this.startCursorPosY) > 5;

    if (cursorMoved) {
      this.dataService.editAllItems(item => {
        const itemInRangeX = item.posX >= this.startCursorPosX && item.posX <= event.pageX
          || item.posX < this.startCursorPosX && item.posX > event.pageX;
        const itemInRangeY = item.posY >= this.startCursorPosY && item.posY <= event.pageY
          || item.posY < this.startCursorPosY && item.posY > event.pageY;

        if (itemInRangeX && itemInRangeY) {
          if (!item.selected) {
            item.selected = true;
            this.dataService.onSelectionChange(item);
          }
        }
      })
    } else if (event.button == 0) {
      this.dataService.addNote(new Note(event.pageX, event.pageY))
    }

    this.resetCursors();
  }

  dropFile(event: any) {
    let posX = event.pageX;
    let posY = event.pageY;
    let data = event.dataTransfer.items[0] as DataTransferItem;
    if (data.kind === 'file') {
      let file = data.getAsFile()!;
      if (file.name.endsWith('notes.json')) {
        file.text().then(text => {
          this.dataService.setFromJson(JSON.parse(text));
        })
      } else if (file.type.startsWith('text') || file.type.startsWith('application')) {
        file.text().then(text => {
          this.dataService.addNote(new Note(posX, posY, text, file.name));
        })
      } else {
        this.hashy.show('Type ' + file.type.toUpperCase() + ' is not supported', 4000, 'Ok');
      }
    } else if (data.kind === 'string') {
      let draggedUrl = event.dataTransfer.getData('text/uri-list');
      if (draggedUrl) {
        let newImage = new Image(posX, posY, draggedUrl);
        this.dataService.addImage(newImage);
      } else {
        let draggedText = event.dataTransfer.getData('text');
        this.dataService.addNote(new Note(posX, posY, draggedText));
      }
    }
  }

  saveItemPosition(event: any, item: { posX: number, posY: number }) {
    event.source._dragRef.reset();

    if (this.dataService.selectedItemsCount) {
      this.dataService.editAllItems(item => {
        if (item.selected) {
          item.posX += event.distance.x;
          item.posY += event.distance.y;
          if (item.posX < 0) {
            item.posX = 0;
          }
          if (item.posY < 49) {
            item.posY = 49;
          }
        }
      });
      this.dataService.removeAllSelections();
    } else {
      item.posX += event.distance.x;
      item.posY += event.distance.y;
      if (item.posX < 0) {
        item.posX = 0;
      }
      if (item.posY < 49) {
        item.posY = 49;
      }
    }

    this.dataService.cacheData();
  }
}
