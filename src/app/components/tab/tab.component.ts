import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit
} from '@angular/core';
import {DraggableNote, Image, Note, Tab} from "@clipboardjesus/models";
import {DataService, HashyService, ClipboardService, SettingsService} from "@clipboardjesus/services";
import {DisposableComponent, ImportDialogComponent} from "@clipboardjesus/components";
import {scrolledPosition} from "@clipboardjesus/helpers";
import {MatBottomSheet} from "@angular/material/bottom-sheet";
import {CdkDragEnd} from "@angular/cdk/drag-drop";
import {takeUntil} from "rxjs";

@Component({
  selector: 'cb-tab',
  templateUrl: './tab.component.html',
  styleUrls: ['./tab.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabComponent extends DisposableComponent implements OnInit {
  @Input() tab?: Tab;
  @Input() draggableChanged?: EventEmitter<void> | undefined;
  @Input() connectionsChanged?: EventEmitter<void> | undefined;

  startCursorPosX = 0;
  startCursorPosY = 0;
  endCursorPosX = 0;
  endCursorPosY = 0;
  mouseDown = false;
  private readonly mouseMoveEvent: OmitThisParameter<(event: MouseEvent) => void>;
  private readonly mouseUpEvent: OmitThisParameter<(event: MouseEvent) => void>;
  private clickedLast200ms = false;

  constructor(
    private readonly hashy: HashyService,
    private readonly elementRef: ElementRef,
    private readonly bottomSheet: MatBottomSheet,
    public readonly dataService: DataService,
    private readonly clipboard: ClipboardService,
    private readonly settings: SettingsService,
    private readonly cdr: ChangeDetectorRef,
  ) {
    super();

    this.mouseMoveEvent = this.docMouseMove.bind(this);
    this.mouseUpEvent = this.docMouseUp.bind(this);
  }

  ngOnInit(): void {
    this.draggableChanged?.pipe(takeUntil(this.destroy$)).subscribe(() =>
      this.cdr.markForCheck()
    );
  }

  /**
   * Sets the properties which are needed to show the selection border.
   * Also attaches the mouse move event listener to update the border.
   * @param event
   */
  tabMouseDown(event: MouseEvent): void {
    if (!this.mouseDown) {
      if (event.button === 0) {
        this.mouseDown = true;
        const scrolled = scrolledPosition();
        this.startCursorPosX = event.pageX + scrolled.left;
        this.startCursorPosY = event.pageY + scrolled.top;
        this.endCursorPosX = event.pageX + scrolled.left;
        this.endCursorPosY = event.pageY + scrolled.top;
      }

      document.addEventListener('mousemove', this.mouseMoveEvent);
      document.addEventListener('mouseup', this.mouseUpEvent);
    }
  }

  /**
   * Updates the cursor position.
   * Just runs, when the user is dragging on the background.
   * @param event
   */
  async docMouseMove(event: MouseEvent): Promise<void> {
    const scrolled = scrolledPosition();
    this.endCursorPosX = event.pageX + scrolled.left;
    this.endCursorPosY = event.pageY + scrolled.top;
    this.cdr.markForCheck();
  }

  /**
   * When the user made a border around any item, set the selected property for this.
   * Includes some extra logic when the user for example pressed some modifiers while dragging.
   * @param event
   */
  async docMouseUp(event: MouseEvent): Promise<void> {
    const scrolled = scrolledPosition();
    const currentPosX = event.pageX + scrolled.left;
    const currentPosY = event.pageY + scrolled.top;
    const movedX = Math.abs(currentPosX - this.startCursorPosX);
    const movedY = Math.abs(currentPosY - this.startCursorPosY);
    const cursorMoved = this.mouseDown && (movedX > 5 || movedY > 5);

    if (cursorMoved) {
      if (!(event.ctrlKey || event.metaKey || event.shiftKey)) {
        this.dataService.removeAllSelections();
      }

      this.dataService.editAllItems(item => {
        const itemInRangeX = item.posX >= this.startCursorPosX && item.posX <= currentPosX
          || item.posX <= this.startCursorPosX && item.posX >= currentPosX;
        const itemInRangeY = item.posY >= this.startCursorPosY && item.posY <= currentPosY
          || item.posY <= this.startCursorPosY && item.posY >= currentPosY;

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
        if (!this.settings.dblClickMode) {
          const clipboardText = await this.clipboard.get();
          if (!clipboardText) {
            this.hashy.show('CLIPBOARD_EMPTY', 3000);
          } else {
            this.dataService.addNote(
              new Note(null, currentPosX, currentPosY, clipboardText)
            );
          }
        } else {
          if (this.clickedLast200ms) {
            const clipboardText = await this.clipboard.get();
            if (!clipboardText) {
              this.hashy.show('CLIPBOARD_EMPTY', 3000);
            } else {
              this.dataService.addNote(
                new Note(null, currentPosX, currentPosY, clipboardText)
              );
            }
          } else {
            this.clickedLast200ms = true;
            setTimeout(() => this.clickedLast200ms = false, 200);
          }
        }
      }
    }

    this.draggableChanged?.emit();
    this.resetCursors();
  }

  /**
   * Add any file that is dropped onto the app.
   * Create notes when it was a text file, import file when it was a notes.json, etc.
   * @param event
   */
  dropFile(event: DragEvent): void {
    const posX = event.pageX;
    const posY = event.pageY;
    const data: DataTransferItem | undefined = event.dataTransfer?.items[0];
    if (data?.kind === 'file') {
      const file = data.getAsFile()!;
      if (file.name.endsWith('.notes.json')) {
        file.text().then(notesJson => {
          const tab = JSON.parse(notesJson) as Tab;
          this.dataService.setFromTabJson(tab);
          this.dataService.cacheData();
        })
      } else if (file.name.endsWith('.boards.json')) {
        file.text().then(boardsJson => {
          if (this.dataService.itemsCount || this.dataService.tabs.length > 1) {
            this.bottomSheet.open(ImportDialogComponent, {data: boardsJson});
          } else {
            this.dataService.tabs = JSON.parse(boardsJson) as Tab[];
            this.dataService.cacheAllData();
          }
        })
      } else if (file.name.endsWith('.cwl')) {
        file.text().then(cwlXml => {
          const getString = (src: string, tag: string): string => src
            .match(new RegExp(`<${tag}>.*?</${tag}>`, 'dms'))?.[0]
            .replace(`<${tag}>`, '')
            .replace(`</${tag}>`, '')!;
          const notes: Note[] = cwlXml.match(/<Note>.*?<\/Note>/dms)?.map(match => {
            const content = getString(match, 'Text');
            const posX = +getString(match, 'Location.X').trim();
            const posY = +getString(match, 'Location.Y').trim();
            return new Note(null, posX, posY, content);
          }) ?? [];

          this.dataService.setFromTabJson({notes});
          this.dataService.cacheData();
        })
      } else if (file.type.startsWith('text') || file.type.startsWith('application')) {
        file.text().then(text => {
          this.dataService.addNote(new Note(null, posX, posY, text, file.name));
        })
      } else if (file.type.startsWith('image')) {
        this.dataService.addImage(new Image(null, posX, posY, null), file);
      } else {
        this.hashy.show(
          {text: 'FILE_TYPE_NOT_SUPPORTED', interpolateParams: {type: file.type.toUpperCase()}},
          4000,
          'OK'
        );
      }
    } else if (data?.kind === 'string') {
      const draggedUrl = event.dataTransfer?.getData('text/uri-list');
      if (draggedUrl) {
        const newImage = new Image(null, posX, posY, draggedUrl);
        this.dataService.addImage(newImage);
      } else {
        const draggedText = event.dataTransfer?.getData('text');
        const newNote = new Note(null, posX, posY, draggedText);
        this.dataService.addNote(newNote);
      }
    }
  }

  /**
   * When the user has moved a draggable, save the position of it.
   * When the user has more than on item selected, move all these.
   * @param event
   * @param item
   */
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

    this.draggableChanged?.emit();
    this.dataService.cacheData();
  }

  @HostListener('document:mouseleave')
  onWindowLeave(): void {
    this.resetCursors();
  }

  /**
   * Reset the cursor properties which were needed for drawing a selection border.
   * @private
   */
  private resetCursors(): void {
    this.startCursorPosX = 0;
    this.startCursorPosY = 0;
    this.endCursorPosX = 0;
    this.endCursorPosY = 0;
    this.mouseDown = false;
    this.elementRef.nativeElement.removeEventListener('mousemove', this.mouseMoveEvent);
    this.elementRef.nativeElement.removeEventListener('mouseup', this.mouseUpEvent);
  }
}
