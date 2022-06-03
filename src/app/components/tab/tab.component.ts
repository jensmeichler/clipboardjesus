import {Component, ElementRef, HostListener, Input} from '@angular/core';
import {DraggableNote, Image, Note, Tab} from "@clipboardjesus/models";
import {DataService, HashyService, ClipboardService} from "@clipboardjesus/services";
import {MatBottomSheet} from "@angular/material/bottom-sheet";
import {ImportDialogComponent} from "@clipboardjesus/components";
import {CdkDragEnd} from "@angular/cdk/drag-drop";

@Component({
  selector: 'cb-tab',
  templateUrl: './tab.component.html',
  styleUrls: ['./tab.component.scss']
})
export class TabComponent {
  @Input() tab?: Tab;

  startCursorPosX = 0;
  startCursorPosY = 0;
  endCursorPosX = 0;
  endCursorPosY = 0;
  mouseDown = false;
  mouseMoveEvent: OmitThisParameter<(event: MouseEvent) => void>;

  constructor(
    private readonly hashy: HashyService,
    private readonly elementRef: ElementRef,
    private readonly bottomSheet: MatBottomSheet,
    public readonly dataService: DataService,
    private readonly clipboard: ClipboardService
  ) {
    this.mouseMoveEvent = this.onMouseMove.bind(this);
  }

  onMouseDown(event: MouseEvent): void {
    if (!this.mouseDown) {
      if (event.button === 0) {
        this.mouseDown = true;
        this.startCursorPosX = event.pageX;
        this.startCursorPosY = event.pageY;
        this.endCursorPosX = event.pageX;
        this.endCursorPosY = event.pageY;
      }

      this.elementRef.nativeElement.addEventListener('mousemove', this.mouseMoveEvent)
    }
  }

  onMouseMove(event: MouseEvent): void {
    this.endCursorPosX = event.pageX;
    this.endCursorPosY = event.pageY;
  }

  async onMouseUp(event: MouseEvent): Promise<void> {
    const cursorMoved = this.mouseDown && (Math.abs(event.pageX - this.startCursorPosX) > 5
      || Math.abs(event.pageY - this.startCursorPosY) > 5);

    this.elementRef.nativeElement.removeEventListener('mousemove', this.mouseMoveEvent)

    if (cursorMoved) {
      if (!(event.ctrlKey || event.metaKey || event.shiftKey)) {
        this.dataService.removeAllSelections();
      }

      this.dataService.editAllItems(item => {
        const itemInRangeX = item.posX >= this.startCursorPosX && item.posX <= event.pageX
          || item.posX <= this.startCursorPosX && item.posX >= event.pageX;
        const itemInRangeY = item.posY >= this.startCursorPosY && item.posY <= event.pageY
          || item.posY <= this.startCursorPosY && item.posY >= event.pageY;

        if (itemInRangeX && itemInRangeY) {
          if (!item.selected) {
            item.selected = true;
          }
        }
      })
    } else if (this.mouseDown && event.button === 0) {
      if (this.dataService.selectedItemsCount) {
        this.dataService.clearSelection();
      } else {
        const clipboardText = await this.clipboard.get();
        if (!clipboardText) {
          //TODO: localize
          this.hashy.show('Your clipboard is empty', 3000);
        } else {
          this.dataService.addNote(
            new Note(event.pageX, event.pageY, clipboardText)
          );
        }
      }
    }

    this.resetCursors();
  }

  dropFile(event: DragEvent): void {
    const posX = event.pageX;
    const posY = event.pageY;
    const data: DataTransferItem | undefined = event.dataTransfer?.items[0];
    if (data?.kind === 'file') {
      const file = data.getAsFile()!;
      if (file.name.endsWith('notes.json')) {
        file.text().then(text => {
          const tab = JSON.parse(text) as Tab;
          this.dataService.setFromTabJson(tab);
          this.dataService.cacheData();
        })
      } else if (file.name.endsWith('boards.json')) {
        file.text().then(text => {
          if (this.dataService.itemsCount || this.dataService.tabs.length > 1) {
            this.bottomSheet.open(ImportDialogComponent, {data: text});
          } else {
            this.dataService.tabs = JSON.parse(text) as Tab[];
            this.dataService.cacheAllData();
          }
        })
      } else if (file.type.startsWith('text') || file.type.startsWith('application')) {
        file.text().then(text => {
          this.dataService.addNote(new Note(posX, posY, text, file.name));
        })
      } else {
        //TODO: localize
        this.hashy.show('Type ' + file.type.toUpperCase() + ' is not supported', 4000, 'OK');
      }
    } else if (data?.kind === 'string') {
      const draggedUrl = event.dataTransfer?.getData('text/uri-list');
      if (draggedUrl) {
        const newImage = new Image(posX, posY, draggedUrl);
        this.dataService.addImage(newImage);
      } else {
        const draggedText = event.dataTransfer?.getData('text');
        const newNote = new Note(posX, posY, draggedText);
        this.dataService.addNote(newNote);
      }
    }
  }

  saveItemPosition(event: CdkDragEnd, item: DraggableNote): void {
    event.source._dragRef.reset();

    if (this.dataService.selectedItemsCount && item.selected) {
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

  @HostListener('document:mouseleave')
  onWindowLeave(): void {
    this.resetCursors();
  }

  private resetCursors(): void {
    this.startCursorPosX = 0;
    this.startCursorPosY = 0;
    this.endCursorPosX = 0;
    this.endCursorPosY = 0;
    this.mouseDown = false;
  }
}
