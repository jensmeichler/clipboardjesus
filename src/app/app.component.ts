import {Clipboard} from "@angular/cdk/clipboard";
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
} from "./components";
import {Note, TaskList} from './models';
import {
  CacheService,
  DataService,
  HashyService,
  SettingsService
} from "./services";
import {Observable} from "rxjs";
import {TranslateService} from "@ngx-translate/core";
import {NoteList} from "./models";
import {CdkDragEnd} from "@angular/cdk/drag-drop";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  @ViewChild(MatMenuTrigger)
  contextMenu!: MatMenuTrigger;
  rightClickPosX = 0;
  rightClickPosY = 0;
  newNotePositionX = 0;
  newNotePositionY = 0;

  canPasteItems = false;

  logoReplacedEasterEggCount = 0;

  constructor(
    private readonly dialog: MatDialog,
    private readonly bottomSheet: MatBottomSheet,
    private readonly clipboard: Clipboard,
    public readonly dataService: DataService,
    public readonly hashy: HashyService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly cache: CacheService,
    private readonly translate: TranslateService,
    public readonly settings: SettingsService
  ) {
    this.translate.setDefaultLang(settings.language);
  }

  ngOnInit(): void {
    let initialized = false;
    this.route.queryParams.subscribe(params => {
      if (initialized) return;
      if (params.tab) {
        const index = this.dataService.tabs
          .find(x => x.label ? x.label === params.tab : (x.index+1) == params.tab)?.index;
        if (index) this.dataService.selectedTabIndex = index;
        initialized = true;
      } else if (params.params) {
        const tab = JSON.parse(atob(params.params));
        if (typeof tab != 'string') {
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
      }
    });
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Tab') {
      this.dataService.selectNextItem(event.shiftKey);
      event.preventDefault();
      event.stopPropagation();
      return;
    } else if (event.key === 'PageUp' || (event.key === 'ArrowLeft' && (event.ctrlKey || event.shiftKey || event.metaKey))) {
      this.dataService.selectNextTab(true);
      event.preventDefault();
      event.stopPropagation();
    } else if (event.key === 'PageDown' || (event.key === 'ArrowRight' && (event.ctrlKey || event.shiftKey || event.metaKey))) {
      this.dataService.selectNextTab(false);
      event.preventDefault();
      event.stopPropagation();
    }

    if (event.ctrlKey || event.metaKey || event.altKey) {
      switch (event.key) {
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
          this.dataService.importItemsFromClipboard();
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
            this.saveAs();
          } else {
            this.save();
          }
          event.preventDefault();
          return;
      }
    }

    if (this.dataService.selectedItemsCount) {
      switch (event.key) {
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
          if (event.ctrlKey || event.metaKey) {
            this.copySelectedItems();
          }
          return;
        case 'x':
          if (event.ctrlKey || event.metaKey) {
            this.cutSelectedItems();
          }
          return;
      }
    }
  }

  copySelectedItems(): void {
    const selectedItems = this.dataService.getSelectedItems();
    this.clipboard.copy(JSON.stringify(selectedItems));
    this.dataService.removeAllSelections();
  }

  cutSelectedItems(): void {
    const selectedItems = this.dataService.getSelectedItems();
    this.clipboard.copy(JSON.stringify(selectedItems));
    this.dataService.deleteSelectedItems();
    this.dataService.removeAllSelections();
  }

  shareTab(): void {
    let params = JSON.stringify(this.dataService.getAsJson(true));
    params = btoa(params);
    const url = 'https://www.clipboardjesus.com/?params=' + params;
    this.clipboard.copy(url);
    this.hashy.show('MAIN.COPIED_URL_TO_CLIPBOARD', 3000, 'COMMON.OK');
  }

  get saveButtonTooltip(): Observable<string> | undefined {
    if (!this.dataService.selectedItemsCount) return;
    const n = this.dataService.selectedItemsCount;
    return this.translate.get('MAIN.SAVE_N_ITEMS', {n});
  }

  save(): void {
    this.dataService.saveAll();
  }

  saveAs(): void {
    this.dataService.saveAllAs();
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
      data: new Note(this.newNotePositionX, this.newNotePositionY, ''),
    }).afterClosed().subscribe((note) => {
      if (note) this.dataService.addNote(note);
    });
  }

  openNewNoteListDialog(): void {
    this.dialog.open(EditNoteListDialogComponent, {
      width: 'var(--width-edit-dialog)',
      data: new NoteList(this.newNotePositionX, this.newNotePositionY),
    }).afterClosed().subscribe((noteList) => {
      if (noteList) this.dataService.addNoteList(noteList);
    });
  }

  openNewTaskListDialog(): void {
    this.dialog.open(EditTaskListDialogComponent, {
      width: 'var(--width-edit-dialog)',
      data: new TaskList(this.newNotePositionX, this.newNotePositionY),
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

  setLanguage(language: string): void {
    this.translate.setDefaultLang(language);
    this.settings.language = language;
  }

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

  async showContextMenu(event: any, ignoreMousePosition?: boolean): Promise<void> {
    event.preventDefault();
    this.rightClickPosX = event.clientX;
    this.rightClickPosY = event.clientY;

    this.dataService.canImportItemsFromClipboard().then(val => this.canPasteItems = val);

    this.contextMenu.openMenu();

    this.newNotePositionX = ignoreMousePosition ? 10 : this.rightClickPosX;
    this.newNotePositionY = ignoreMousePosition ? 61 : this.rightClickPosY;
  }
}
