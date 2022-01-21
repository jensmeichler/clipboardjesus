import {Clipboard} from "@angular/cdk/clipboard";
import {Component, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatBottomSheet} from "@angular/material/bottom-sheet";
import {MatDialog} from "@angular/material/dialog";
import {MatMenuTrigger} from "@angular/material/menu";
import {ActivatedRoute, Router} from "@angular/router";
import {Subscription} from "rxjs";
import {AboutDialogComponent} from "./components/dialogs/about-dialog/about-dialog.component";
import {DeleteDialogComponent} from "./components/dialogs/delete-dialog/delete-dialog.component";
import {EditNoteDialogComponent} from "./components/dialogs/edit-note-dialog/edit-note-dialog.component";
import {EditTabDialogComponent} from "./components/dialogs/edit-tab-dialog/edit-tab-dialog.component";
import {EditTaskListDialogComponent} from "./components/dialogs/edit-task-list-dialog/edit-task-list-dialog.component";
import {Note, TaskList} from './models';
import {CacheService} from "./services/cache.service";
import {DataService} from "./services/data.service";
import {HashyService} from "./services/hashy.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, OnDestroy {
  queryParamsSubscription?: Subscription;

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
    private readonly cache: CacheService
  ) {
  }

  ngOnInit(): void {
    this.queryParamsSubscription = this.route.queryParams.subscribe(params => {
      if (params.params) {
        const tab = JSON.parse(params.params);
        if (typeof tab != 'string') {
          if (this.dataService.tabs.length == 1
            && this.dataService.itemsCount == 0) {
            this.cache.save(0, tab);
            this.dataService.selectedTabIndex = 0;
          } else {
            this.dataService.addTab(tab);
          }
        }

        this.router.navigate(
          ['.'],
          {relativeTo: this.route}
        );
      }
    });
  }

  ngOnDestroy(): void {
    this.queryParamsSubscription?.unsubscribe();
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (event.key == 'Tab') {
      this.dataService.selectNextItem(event.shiftKey);
      event.preventDefault();
      event.stopPropagation();
      return;
    } else if (event.key == 'PageUp' || (event.key == 'ArrowLeft' && (event.ctrlKey || event.shiftKey || event.metaKey))) {
      this.dataService.selectNextTab(true);
      event.preventDefault();
      event.stopPropagation();
    } else if (event.key == 'PageDown' || (event.key == 'ArrowRight' && (event.ctrlKey || event.shiftKey || event.metaKey))) {
      this.dataService.selectNextTab(false);
      event.preventDefault();
      event.stopPropagation();
    } else if (event.ctrlKey || event.metaKey || event.altKey) {
      if (event.key == 't' || event.key == 'n') {
        this.dataService.addTab();
      } else if (event.key == 'w') {
        this.dataService.removeTab();
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
    if (event.ctrlKey || event.metaKey) {
      if (event.key == 'v') {
        this.dataService.importItemsFromClipboard();
      } else if (event.key == 'y' || (event.shiftKey && event.key == 'z')) {
        this.dataService.redo();
      } else if (event.key == 'z') {
        this.dataService.undo();
      } else if (event.key == 'a') {
        this.dataService.selectAll();
        event.preventDefault();
      } else if (event.key == 's') {
        if (event.shiftKey) {
          this.saveAs();
        } else {
          this.save();
        }
        event.preventDefault();
      }
    }
  }

  copySelectedItems() {
    const selectedItems = this.dataService.getSelectedItems();
    this.clipboard.copy(JSON.stringify(selectedItems));
    this.dataService.removeAllSelections();
  }

  cutSelectedItems() {
    const selectedItems = this.dataService.getSelectedItems();
    this.clipboard.copy(JSON.stringify(selectedItems));
    this.dataService.deleteSelectedItems();
    this.dataService.removeAllSelections();
  }

  shareTab() {
    let params = JSON.stringify(this.dataService.getAsJson(true));
    params = encodeURIComponent(params);
    const url = 'https://jensmeichler.github.io/clipboard/?params=' + params;
    this.clipboard.copy(url);
    this.hashy.show('Copied url to clipboard', 3000, 'Ok');
  }

  save() {
    this.dataService.saveAll();
  }

  saveAs() {
    this.dataService.saveAllAs();
  }

  saveTabOrSelection() {
    this.dataService.saveTabOrSelection();
  }

  deleteSelectedItems() {
    this.dataService.deleteSelectedItems();
  }

  openNewNoteDialog() {
    this.dialog.open(EditNoteDialogComponent, {
      width: 'var(--width-edit-dialog)',
      data: new Note(this.newNotePositionX, this.newNotePositionY, ''),
    }).afterClosed().subscribe((note) => {
      if (note) {
        this.dataService.addNote(note);
      }
    });
  }

  openNewTaskListDialog() {
    this.dialog.open(EditTaskListDialogComponent, {
      width: 'var(--width-edit-dialog)',
      data: new TaskList(this.newNotePositionX, this.newNotePositionY),
    }).afterClosed().subscribe((taskList) => {
      if (taskList) {
        this.dataService.addTaskList(taskList);
      }
    });
  }

  openEditTabDialog() {
    this.dialog.open(EditTabDialogComponent, {
      width: 'var(--width-edit-dialog)',
      data: this.dataService.tabs[this.dataService.selectedTabIndex],
      disableClose: true,
    }).afterClosed().subscribe((tab) => {
      if (tab) {
        this.dataService.cacheData();
      } else {
        this.dataService.tabs[this.dataService.selectedTabIndex] = this.cache.fetch(this.dataService.selectedTabIndex)!;
      }
    });
  }

  clearAllForever() {
    this.bottomSheet.open(DeleteDialogComponent);
  }

  showAboutDialog() {
    this.dialog.open(AboutDialogComponent);
  }

  replaceLogo(event: any) {
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
    })
  }

  async showContextMenu(event: any, ignoreMousePosition?: boolean) {
    event.preventDefault();
    this.rightClickPosX = event.clientX;
    this.rightClickPosY = event.clientY;

    this.canPasteItems = await this.dataService.canImportItemsFromClipboard();

    this.contextMenu.openMenu();

    this.newNotePositionX = ignoreMousePosition ? 10 : this.rightClickPosX;
    this.newNotePositionY = ignoreMousePosition ? 61 : this.rightClickPosY;
  }
}
