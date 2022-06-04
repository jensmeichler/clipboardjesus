import {Component, HostListener, OnInit, ViewChild} from '@angular/core';
import {MatBottomSheet} from "@angular/material/bottom-sheet";
import {MatDialog} from "@angular/material/dialog";
import {MatMenuTrigger} from "@angular/material/menu";
import {ActivatedRoute, Router} from "@angular/router";
import {
  AboutDialogComponent,
  DeleteDialogComponent,
  EditNoteDialogComponent,
  EditTabDialogComponent,
  EditTaskListDialogComponent,
  EditNoteListDialogComponent
} from "@clipboardjesus/components";
import {
  Note,
  Tab,
  TaskList,
  NoteList
} from '@clipboardjesus/models';
import {
  CacheService,
  DataService,
  FileAccessService,
  HashyService,
  SettingsService,
  ClipboardService
} from "@clipboardjesus/services";
import {TranslateService} from "@ngx-translate/core";
import {CdkDragEnd} from "@angular/cdk/drag-drop";
import {dialog} from "@tauri-apps/api";

@Component({
  selector: 'cb-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  @ViewChild(MatMenuTrigger)
  contextMenu!: MatMenuTrigger;
  rightClickPosX = 0;
  rightClickPosY = 0;
  newDraggablePositionX = 0;
  newDraggablePositionY = 0;

  canPasteItems = false;

  logoReplacedEasterEggCount = 0;

  initialized = false;
  accessible = false;

  constructor(
    private readonly dialog: MatDialog,
    private readonly bottomSheet: MatBottomSheet,
    private readonly clipboard: ClipboardService,
    public readonly dataService: DataService,
    public readonly hashy: HashyService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly cache: CacheService,
    private readonly translate: TranslateService,
    public readonly settings: SettingsService,
    private readonly fileAccessService: FileAccessService,
  ) {
  }

  ngOnInit(): void {
    // No user interaction while "splash screen"
    setTimeout(() => this.accessible = true, 2000);

    this.route.queryParams.subscribe(params => {
      if (this.initialized) return;

      if (params.tab) {
        const index = this.dataService.tabs
          .find(x => x.label ? x.label === params.tab : (x.index+1) == params.tab)?.index;
        if (index !== undefined) {
          this.dataService.selectedTabIndex = index;
        }
        this.initialized = true;
      } else if (params.params) {
        const tab = JSON.parse(atob(params.params));
        if (typeof tab !== 'string') {
          if (this.dataService.tabs.length === 1
            && this.dataService.itemsCount === 0) {
            this.cache.save(0, tab);
            this.dataService.selectedTabIndex = 0;
          } else {
            this.dataService.addTab(tab);
            this.dataService.moveLastTabToFirstPosition();
          }
        }

        // Clear the query params and initialize the app from localstorage
        this.router.navigate(
          ['.'],
          {relativeTo: this.route}
        ).then(() => {
          window.location.reload();
        });
      } else {
        // Hack for fade in animation on startup
        setTimeout(() => this.initialized = true);
      }
    });
  }

  @HostListener('document:keydown', ['$event'])
  async onKeyDown(event: KeyboardEvent): Promise<void> {
    const key = event.key;
    const ctrl = event.ctrlKey || event.metaKey;
    const shift = event.shiftKey;
    const alt = event.altKey;

    if (this.dataService.selectedItemsCount) {
      switch (key) {
        case 'Delete':
        case 'Backspace':
          this.deleteSelectedItems();
          return;
        case 'ArrowUp':
          this.dataService.editAllSelectedItems(x => x.posY--);
          this.dataService.cacheData();
          return;
        case 'ArrowDown':
          this.dataService.editAllSelectedItems(x => x.posY++);
          this.dataService.cacheData();
          return;
        case 'ArrowLeft':
          this.dataService.editAllSelectedItems(x => x.posX--);
          this.dataService.cacheData();
          return;
        case 'ArrowRight':
          this.dataService.editAllSelectedItems(x => x.posX++);
          this.dataService.cacheData();
          return;
        case 'Escape':
          this.dataService.removeAllSelections();
          return;
        case 'c':
          if (ctrl) {
            await this.copySelectedItems();
          }
          return;
        case 'x':
          if (ctrl) {
            await this.cutSelectedItems();
          }
          return;
      }
    }

    if (ctrl || shift || alt) {
      switch (key) {
        case 't':
        case 'n':
          if (event.shiftKey) {
            this.dataService.restoreTab();
          } else {
            this.dataService.addTab();
          }
          return;
        case 'T':
          this.dataService.restoreTab();
          return;
        case 'w':
          this.dataService.removeTab();
          return;
        case 'v':
          await this.dataService.importItemsFromClipboard();
          return;
        case 'z':
          if (event.shiftKey) {
            this.dataService.redo();
          } else {
            this.dataService.undo();
          }
          return;
        case 'y':
          this.dataService.redo();
          return;
        case 'a':
          this.dataService.selectAll();
          event.preventDefault();
          return;
        case 's':
          if (event.shiftKey) {
            await this.saveAs();
          } else {
            await this.save();
          }
          event.preventDefault();
          return;
        case 'ArrowLeft':
          this.dataService.selectNextTab(true);
          event.preventDefault();
          event.stopPropagation();
          return;
        case 'ArrowRight':
          this.dataService.selectNextTab(false);
          event.preventDefault();
          event.stopPropagation();
          return;
      }
    }

    switch (key) {
      case 'Tab':
        this.dataService.selectNextItem(event.shiftKey);
        event.preventDefault();
        event.stopPropagation();
        return;
      case 'PageUp':
        this.dataService.selectNextTab(true);
        event.preventDefault();
        event.stopPropagation();
        return;
      case 'PageDown':
        this.dataService.selectNextTab(false);
        event.preventDefault();
        event.stopPropagation();
        return;
    }
  }

  async copySelectedItems(): Promise<void> {
    const selectedItems = this.dataService.getSelectedItems();
    await this.clipboard.set(JSON.stringify(selectedItems));
    this.dataService.removeAllSelections();
  }

  async cutSelectedItems(): Promise<void> {
    const selectedItems = this.dataService.getSelectedItems();
    await this.clipboard.set(JSON.stringify(selectedItems));
    this.dataService.deleteSelectedItems();
    this.dataService.removeAllSelections();
  }

  async shareTab(): Promise<void> {
    const params = JSON.stringify(this.dataService.getAsJson(true));
    await this.clipboard.set(`https://www.clipboardjesus.com/?params=${btoa(params)}`);
    this.hashy.show('COPIED_URL_TO_CLIPBOARD', 3000, 'OK');
  }

  async save(): Promise<void> {
    return this.dataService.saveAll();
  }

  async saveAs(): Promise<void> {
    await this.dataService.saveAllAs();
  }

  async openFileDialog(): Promise<void> {
    const options = {
      multiple: false,
      filters: [{
        name: '*.boards.json | JSON',
        extensions: ['boards.json']
      }]
    };
    return dialog.open(options).then(async (path) => {
      if (typeof path !== 'string') return;

      const contents = await this.fileAccessService.read(path);
      if (contents) {
        const tabs = JSON.parse(contents) as Tab[];
        const isTabsArray = Array.isArray(tabs)
          && tabs[0].index !== undefined
          && tabs[0].color !== undefined
          && (tabs[0].images?.length
            || tabs[0].notes?.length
            || tabs[0].noteLists?.length
            || tabs[0].taskLists?.length);
        const importFile: () => void = () => {
          this.dataService.clearCache();
          this.dataService.tabs = tabs;
          this.dataService.selectedTabIndex = 0;
          this.dataService.cacheAllData();
        }

        if (isTabsArray) {
          importFile();
        } else {
          this.hashy.show('Could not read file', 7000, 'Try anyway', () =>
            importFile()
          );
        }
      }
    })
  }

  saveTabOrSelection(): void {
    this.dataService.saveTabOrSelection();
  }

  deleteSelectedItems(): void {
    this.dataService.deleteSelectedItems();
  }

  openNewNoteDialog(): void {
    this.dialog.open(EditNoteDialogComponent, {
      width: 'var(--width-edit-dialog)',
      data: new Note(this.newDraggablePositionX, this.newDraggablePositionY, ''),
    }).afterClosed().subscribe((note) => {
      if (note) this.dataService.addNote(note);
    });
  }

  openNewNoteListDialog(): void {
    this.dialog.open(EditNoteListDialogComponent, {
      width: 'var(--width-edit-dialog)',
      data: new NoteList(this.newDraggablePositionX, this.newDraggablePositionY),
    }).afterClosed().subscribe((noteList) => {
      if (noteList) this.dataService.addNoteList(noteList);
    });
  }

  openNewTaskListDialog(): void {
    this.dialog.open(EditTaskListDialogComponent, {
      width: 'var(--width-edit-dialog)',
      data: new TaskList(this.newDraggablePositionX, this.newDraggablePositionY),
    }).afterClosed().subscribe((taskList) => {
      if (taskList) this.dataService.addTaskList(taskList);
    });
  }

  openEditTabDialog(): void {
    this.dialog.open(EditTabDialogComponent, {
      width: 'var(--width-edit-dialog)',
      data: this.dataService.tabs[this.dataService.selectedTabIndex],
      disableClose: true,
    }).afterClosed().subscribe((tab) => {
      if (tab) {
        this.dataService.cacheData();
        this.dataService.updateAppTitle();
      } else {
        this.dataService.tabs[this.dataService.selectedTabIndex] = this.cache.fetch(this.dataService.selectedTabIndex)!;
      }
    });
  }

  clearAllForever(): void {
    this.bottomSheet.open(DeleteDialogComponent);
  }

  showAboutDialog(): void {
    this.dialog.open(AboutDialogComponent);
  }

  reloadApp(): void {
    window.location.reload();
  }

  /** Easter egg 🐰 */
  replaceLogo(event: CdkDragEnd): void {
    let question = 'Hmmpf...';
    let answer: string | undefined = 'Okay.. sorry';
    switch (this.logoReplacedEasterEggCount) {
      case 0:
        question = 'Hey... Stop that..';
        answer = 'Ups';
        break;
      case 1:
        question = 'Are you okay?';
        answer = "I'm fine";
        break;
      case 2:
        question = 'What are you doing?!';
        answer = 'Just kidding';
        break;
      case 3:
        question = 'Why?';
        answer = "Uhm..";
        break;
      case 4:
        question = 'Stop that!';
        answer = 'Kk..';
        break;
      case 5:
        question = 'Stop that!! Now!';
        answer = 'Okaaaay!';
        break;
      case 6:
        question = 'Are you kidding me?!';
        answer = 'Maybe';
        break;
      case 7:
        question = 'What is your f***ing problem?!';
        answer = "Ok.. I'll stop";
        break;
      case 8:
        question = 'You need help!';
        answer = '...';
        break;
      case 9:
        question = '...';
        answer = undefined;
        break;
      case 10:
        question = 'Congratulations.. you won the idiot award';
        answer = undefined;
        const idiotAward: Note = {
          posX: 0,
          posY: 160,
          posZ: 100,
          backgroundColor: '#FFDA0054',
          foregroundColor: '#FEE858',
          header: 'Idiot award',
          content: '( ︶︿︶)_🖕'
        }
        this.dataService.addNote(idiotAward);
        break;
    }
    this.hashy.show(question, 5000, answer, undefined, () => {
      this.logoReplacedEasterEggCount++;
      event.source._dragRef.reset();
    });
  }

  /**
   * Open the main context menu of a tab.
   * This method saves the current mouse position to create
   * the draggable at this position (if chosen in context menu).
   * @param event
   * @param ignoreMousePosition If {@link true} the new draggable
   *  will be created in the top left corner of the tab
   */
  showContextMenu(event: MouseEvent, ignoreMousePosition?: boolean): void {
    event.preventDefault();
    this.rightClickPosX = event.clientX;
    this.rightClickPosY = event.clientY;
    this.dataService.canImportItemsFromClipboard().then(val => this.canPasteItems = val);
    this.contextMenu.openMenu();
    this.newDraggablePositionX = ignoreMousePosition ? 10 : this.rightClickPosX;
    this.newDraggablePositionY = ignoreMousePosition ? 61 : this.rightClickPosY;
  }
}
