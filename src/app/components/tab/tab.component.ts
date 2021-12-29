import {Component} from '@angular/core';
import {Image, Note} from "../../models";
import {DataService} from "../../services/data.service";
import {HashyService} from "../../services/hashy.service";

@Component({
  selector: 'clipboard-tab',
  templateUrl: './tab.component.html',
  styleUrls: ['./tab.component.css']
})
export class TabComponent {
  constructor(
    private readonly hashy: HashyService,
    public readonly dataService: DataService) {
  }

  newNote(event: MouseEvent) {
    this.dataService.addNote(new Note(event.pageX, event.pageY))
  }

  dropFile(event: any) {
    let posX = event.pageX;
    let posY = event.pageY;
    let data = event.dataTransfer.items[0] as DataTransferItem;
    if (data.kind === 'file') {
      let file = data.getAsFile()!;
      if (file.name.endsWith('notes.json')) {
        file.text().then(text => {
          this.dataService.setFromJson(text);
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
    item.posX += event.distance.x;
    item.posY += event.distance.y;
    if (item.posX < 0) {
      item.posX = 0;
    }
    if (item.posY < 50) {
      item.posY = 50;
    }

    this.dataService.cacheData();
  }
}
