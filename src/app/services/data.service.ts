import {Injectable, OnDestroy} from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {SaveAsDialogComponent} from "@clipboardjesus/components";
import {
  DraggableNote,
  Image,
  Note,
  Tab,
  TaskList,
  NoteList
} from "@clipboardjesus/models";
import {
  CacheService,
  FileService,
  HashyService,
  FileAccessService,
  ClipboardService,
  StorageService
} from "@clipboardjesus/services";
import {ActivatedRoute, Router} from "@angular/router";
import {_blank, isTauri} from "@clipboardjesus/const";
import {dialog} from "@tauri-apps/api";
import welcomeTab from '../../assets/screens/welcome.json';
import {Subject, takeUntil} from "rxjs";

@Injectable({providedIn: 'root'})
export class DataService implements OnDestroy {
  /**
   * @returns '_blank' or '_tauri' according to the platform you are on.
   * */
  get _blank(): string { return _blank; };

  private _selectedTabIndex = 0;
  get selectedTabIndex(): number { return this._selectedTabIndex; }
  set selectedTabIndex(index: number) {
    this._selectedTabIndex = index;
    (async () => await this.updateAppTitle())();
  }

  tabs: Tab[] = [];
  get tab(): Tab { return this.tabs[this.selectedTabIndex]; }
  set tab(tab: Tab) { this.tabs[this.selectedTabIndex] = tab; }

  redoPossible = this.cache.redoPossible;
  undoPossible = this.cache.undoPossible;
  restorePossible = this.cache.restorePossible;

  private colorizedObjects: (Note | TaskList | NoteList)[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private readonly dialog: MatDialog,
    private readonly hashy: HashyService,
    private readonly cache: CacheService,
    private readonly fileService: FileService,
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly fileAccessService: FileAccessService,
    private readonly clipboard: ClipboardService,
    storageService: StorageService
  ) {
    cache.getJsonFromAll().forEach((tab) =>
      this.tabs.push(tab)
    );

    if (!this.tabs.length) {
      this.addWelcomePage();
    }

    this._selectedTabIndex = 0;
    this.setColorizedObjects();

    storageService.onTabChanged.pipe(takeUntil(this.destroy$)).subscribe(({tab, index}) =>
      this.tabs[index] = tab
    );
    storageService.onTabDeleted.pipe(takeUntil(this.destroy$)).subscribe((index) =>
      this.removeTab(index)
    );
  }

  /**
   * Writes the current selected tab into the app title.
   */
  async updateAppTitle(): Promise<void> {
    const appTitle = document.getElementById('title');
    if (!appTitle) {
      return;
    }

    const tab = this.tabs[this._selectedTabIndex];
    const tabName = tab.label ?? `#Board ${this._selectedTabIndex+1}`;
    appTitle.innerText = `Clip#board | ${tabName}`;

    await this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { tab: tab.label ? tabName : (tab.index+1) }
    });
  }

  /**
   * @returns The total count of all items on the currently selected tab.
   */
  get itemsCount(): number {
    return (this.tab.notes?.length ?? 0)
      + (this.tab.taskLists?.length ?? 0)
      + (this.tab.images?.length ?? 0)
      + (this.tab.noteLists?.length ?? 0);
  }

  get selectedItemsCount(): number {
    return (this.tab.notes?.filter(x => x.selected).length ?? 0)
      + (this.tab.taskLists?.filter(x => x.selected).length ?? 0)
      + (this.tab.noteLists?.filter(x => x.selected).length ?? 0)
      + (this.tab.images?.filter(x => x.selected).length ?? 0);
  }

  private static compareNote(left: Note, right: Note): boolean {
    return left.content === right.content
      && left.header === right.header
      && left.posX === right.posX
      && left.posY === right.posY;
  }

  private static compareTaskList(left: TaskList, right: TaskList): boolean {
    return left.header === right.header
      && left.posX === right.posX
      && left.posY === right.posY;
  }

  private static compareNoteList(left: NoteList, right: NoteList): boolean {
    return left.notes.every(leftNote => right.notes.some(rightNote => DataService.compareNote(leftNote, rightNote)))
      && right.notes.every(rightNote => left.notes.some(leftNote => DataService.compareNote(leftNote, rightNote)))
      && left.header === right.header
      && left.posX === right.posX
      && left.posY === right.posY;
  }

  private static compareImage(left: Image, right: Image): boolean {
    return left.source === right.source
      && left.posX === right.posX
      && left.posY === right.posY;
  }

  private static compareColors(left: Note | TaskList | NoteList, right: Note | TaskList | NoteList): boolean {
    if (!left || !right) {
      return false;
    }
    return left.backgroundColor === right.backgroundColor
      && left.backgroundColorGradient === right.backgroundColorGradient
      && left.foregroundColor === right.foregroundColor
  }

  /**
   * Stores the current tab into the change history and loads the last state of the tab.
   */
  undo(): void {
    if (!this.cache.undo(this.selectedTabIndex)) {
      return;
    }
    this.tab = this.cache.fetch(this.selectedTabIndex)!;
  }

  /**
   * Stores the current tab into the change history and loads the last undone state of the tab.
   */
  redo(): void {
    if (!this.cache.redo(this.selectedTabIndex)) {
      return;
    }
    this.tab = this.cache.fetch(this.selectedTabIndex)!;
  }

  /**
   * Recreate the last deleted tab and add it to the app.
   */
  restoreTab(): void {
    const recreatedTab = this.cache.recreate();
    if (recreatedTab) this.addTab(recreatedTab);
  }

  getColorizedObjects(excludedItem: Note | TaskList): (Note | TaskList)[] {
    return this.colorizedObjects.filter(item => !DataService.compareColors(excludedItem, item));
  }

  selectAll(): void {
    this.editAllItems(item => item.selected = true);
  }

  removeAllSelections(): void {
    this.editAllItems(item => item.selected = undefined);
  }

  editAllSelectedItems(action: (item: DraggableNote) => void): void {
    this.editAllItems(x => x.selected ? action(x) : {})
  }

  editAllItems(action: (item: DraggableNote) => void): void {
    this.tab.notes?.forEach(action);
    this.tab.taskLists?.forEach(action);
    this.tab.images?.forEach(action);
    this.tab.noteLists?.forEach(action);
  }

  filterAllItems(action: (item: DraggableNote) => boolean): void {
    this.tab.notes = this.tab.notes?.filter(action);
    this.tab.taskLists = this.tab.taskLists?.filter(action);
    this.tab.images = this.tab.images?.filter(action);
    this.tab.noteLists = this.tab.noteLists?.filter(action);
  }

  cacheData(): void {
    this.cache.save(this.selectedTabIndex, this.getAsJson(true));
    this.setColorizedObjects();
  }

  cacheAllData(): void {
    const currentTabIndex = this.selectedTabIndex;
    this.tabs.forEach(tab => {
      this.selectedTabIndex = tab.index;
      this.cache.save(this.selectedTabIndex, this.getAsJson(true));
    })
    this.selectedTabIndex = currentTabIndex;
    this.setColorizedObjects();
  }

  addTab(tab?: Tab): void {
    if (tab) tab.index = this.tabs.length;
    const newTab: Tab = tab ?? {
      index: this.tabs.length,
      color: '#131313'
    };
    this.tabs.push(newTab);
    this.cache.save(newTab.index, newTab);
    this.selectedTabIndex = newTab.index;
  }

  addWelcomePage(): void {
    this._selectedTabIndex = 0;
    this.tab = welcomeTab;
    this.cache.save(0, welcomeTab);
  }

  async canImportItemsFromClipboard(): Promise<boolean> {
    const clipboardText = await this.clipboard.get();
    if (!clipboardText) {
      return false;
    }

    try {
      const tab: Tab = JSON.parse(clipboardText);
      return !!(tab.notes?.length || tab.taskLists?.length || tab.images?.length);
    } catch {
      return false;
    }
  }

  async importItemsFromClipboard(): Promise<boolean> {
    const clipboardText = await this.clipboard.get();
    if (!clipboardText) {
      return false;
    }

    try {
      const tab: Tab = JSON.parse(clipboardText);
      tab.notes?.forEach(note => this.addNote(note));
      tab.taskLists?.forEach(taskList => this.addTaskList(taskList));
      tab.images?.forEach(image => this.addImage(image));
      tab.noteLists?.forEach(noteList => this.addNoteList(noteList));
    } catch {
      this.addNote(new Note(null, 10, 61, clipboardText));
    }

    this.cacheData();
    return true;
  }

  private rearrangeTabIndices(): void {
    let i = 0;
    this.tabs.forEach(tab => tab.index = i++);
  }

  /**
   * Deletes a tab from tab array and from the cache.
   * Navigates to the next tab if current tab was removed.
   */
  removeTab(index: number): void {
    if (index === this.selectedTabIndex) {
      return this.removeCurrentTab();
    }

    this.tabs = this.tabs.filter(x => x.index !== index);
    this.rearrangeTabIndices();
  }

  /**
   * Deletes the current tab from the tab array and from the cache.
   */
  removeCurrentTab(): void {
    const index = this.selectedTabIndex;
    this.cache.remove(index);

    this.rearrangeTabIndices();

    const result = this.tabs.filter(tab => tab.index < index);
    const rightTabs = this.tabs.filter(tab => tab.index > index);
    rightTabs.forEach(tab => {
      const oldIndex = tab.index;
      const newIndex = tab.index - 1;

      const tabContent = this.cache.fetch(oldIndex);
      this.cache.remove(oldIndex);
      this.cache.save(newIndex, tabContent!)

      tab.index--;
      result.push(tab);
    });
    this.tabs = result;

    const isRightTab = index > (this.tabs.length - 1);
    this.selectedTabIndex = isRightTab ? index - 1 : index;
  }

  reArrangeTab(sourceIndex: number, targetIndex: number): void {
    const sourceTabCopy: Tab = JSON.parse(JSON.stringify(this.tabs[sourceIndex]));
    const targetTabCopy: Tab = JSON.parse(JSON.stringify(this.tabs[targetIndex]));
    this.cache.remove(targetIndex);

    sourceTabCopy.index = targetIndex;
    targetTabCopy.index = sourceIndex;

    this.tabs[targetIndex] = sourceTabCopy;
    this.tabs[sourceIndex] = targetTabCopy;

    this.cache.save(targetIndex, sourceTabCopy)
    this.cache.save(sourceIndex, targetTabCopy)

    this.selectedTabIndex = targetIndex;
  }

  moveLastTabToFirstPosition(): void {
    for (let i = this.tabs.length - 1; i; i--) {
      this.reArrangeTab(i, i - 1);
    }
  }

  clearSelection(): void {
    this.editAllItems(item => item.selected = false);
    this.cacheData();
  }

  deleteSelectedItems(): void {
    this.filterAllItems(item => !item.selected)
    this.cacheData();
  }

  clearCache(): void {
    for (let i = 0; i < 20; i++) {
      this.cache.remove(i);
    }
    this.selectedTabIndex = 0;
    this.tabs = [];
    this.addTab();
  }

  addNote(note: Note): void {
    this.defineIndex(note);
    this.tab.notes ??= [];
    this.tab.notes.push(note);
    this.cacheData();
  }

  addNoteList(noteList: NoteList): void {
    this.defineIndex(noteList);
    this.tab.noteLists ??= [];
    this.tab.noteLists.push(noteList);
    this.cacheData();
  }

  addTaskList(taskList: TaskList): void {
    this.defineIndex(taskList);
    this.tab.taskLists ??= [];
    this.tab.taskLists.push(taskList);
    this.cacheData();
  }

  addImage(image: Image): void {
    this.defineIndex(image);
    this.tab.images ??= [];
    this.tab.images.push(image);
    this.cacheData();
  }

  deleteNote(note: Note, skipIndexing?: boolean): void {
    this.disconnectAll(note);
    this.tab.notes = this.tab.notes?.filter(x => x !== note);
    if (!skipIndexing) {
      this.reArrangeIndices();
      this.cacheData();
    }
  }

  deleteTaskList(taskList: TaskList, skipIndexing?: boolean): void {
    this.disconnectAll(taskList);
    this.tab.taskLists = this.tab.taskLists?.filter(x => x !== taskList);
    if (!skipIndexing) {
      this.reArrangeIndices();
      this.cacheData();
    }
  }

  deleteNoteList(noteList: NoteList, skipIndexing?: boolean): void {
    this.disconnectAll(noteList);
    this.tab.noteLists = this.tab.noteLists?.filter(x => x !== noteList);
    if (!skipIndexing) {
      this.reArrangeIndices();
      this.cacheData();
    }
  }

  deleteImage(image: Image): void {
    this.disconnectAll(image);
    this.tab.images = this.tab.images?.filter(x => x !== image);
    this.reArrangeIndices();
    this.cacheData();
  }

  getSelectedItems(): Tab {
    const tab = JSON.parse(JSON.stringify(this.tab)) as Tab;

    tab.notes = tab.notes?.filter(x => x.selected);
    tab.taskLists = tab.taskLists?.filter(x => x.selected);
    tab.images = tab.images?.filter(x => x.selected);
    tab.noteLists = tab.noteLists?.filter(x => x.selected);

    tab.notes?.forEach(note => note.selected = false);
    tab.taskLists?.forEach(taskList => taskList.selected = false);
    tab.images?.forEach(image => image.selected = false);
    tab.noteLists?.forEach(noteList => noteList.selected = false);

    return tab;
  }

  getAsJson(ignoreSelection?: boolean): Tab {
    if (ignoreSelection || !this.selectedItemsCount) {
      return this.tab;
    }
    return this.getSelectedItems();
  }

  setFromTabJson(tab: Partial<Tab>, skipCache?: boolean): void {
    tab.notes?.forEach(note => {
      this.tab.notes ??= [];
      if (!this.tab.notes.some(curr => DataService.compareNote(note, curr))) {
        this.tab.notes.push(note);
      }
    });
    tab.noteLists?.forEach(noteList => {
      this.tab.noteLists ??= [];
      if (!this.tab.noteLists.some(curr => DataService.compareNoteList(noteList, curr))) {
        this.tab.noteLists.push(noteList);
      }
    });
    tab.taskLists?.forEach(taskList => {
      this.tab.taskLists ??= [];
      if (!this.tab.taskLists.some(curr => DataService.compareTaskList(taskList, curr))) {
        this.tab.taskLists.push(taskList);
      }
    });
    tab.images?.forEach(image => {
      this.tab.images ??= [];
      if (!this.tab.images.some(curr => DataService.compareImage(image, curr))) {
        this.tab.images.push(image);
      }
    });

    if (!skipCache) this.cacheData();
    this.reArrangeIndices();
  }

  async saveAllAs(): Promise<void> {
    if (isTauri) {
      return dialog.save().then(async (path) => {
        const jsonString = JSON.stringify(this.getAsJson(true));
        const fileName = `${path.replace('.boards.json', '')}.boards.json`;
        await this.fileAccessService.write(jsonString, fileName);
      })
    } else {
      this.dialog.open(SaveAsDialogComponent, {
        position: {
          bottom: '90px',
          right: 'var(--margin-edge)'
        }
      }).afterClosed().subscribe(async (filename) => {
        if (filename) await this.saveAll(filename);
      });
    }
  }

  async saveAll(fileName?: string): Promise<void> {
    const json = this.cache.getJsonFromAll();
    const contents = JSON.stringify(json);
    if (isTauri) {
      fileName = fileName
        ? `${fileName.replace('.boards.json', '')}.boards.json`
        : undefined;
      await this.fileAccessService.write(contents, fileName);
    } else {
      const savedAs = this.fileService.save(contents, 'boards.json', fileName);
      this.hashy.show(
        {text: 'SAVED_TABS_AS', interpolateParams: {savedAs}},
        3000,
        'OK'
      );
    }
  }

  saveTabOrSelection(filename?: string): void {
    const json = this.getAsJson();
    this.removeAllSelections();
    const savedAs = this.fileService.save(JSON.stringify(json), 'notes.json', filename);
    this.hashy.show(
      {text: 'SAVED_TAB_AS', interpolateParams: {savedAs}},
      3000,
      'OK'
    );
    this.cacheData();
  }

  bringToFront(item: DraggableNote): void {
    item.posZ = this.getNextIndex();
    this.reArrangeIndices();
  }

  bringForward(item: DraggableNote): void {
    item.posZ! += 1.5;
    this.reArrangeIndices();
  }

  sendBackward(item: DraggableNote): void {
    item.posZ! -= 1.5;
    this.reArrangeIndices();
  }

  flipToBack(item: DraggableNote): void {
    item.posZ = 0;
    this.reArrangeIndices();
  }

  moveNoteToTab(index: number, note: Note): void {
    const otherTab = this.cache.fetch(index)!;
    otherTab.notes ??= [];
    otherTab.notes.push(note);
    this.deleteNote(note);
    this.cache.save(index, otherTab);
    this.tabs[index] = otherTab;
  }

  moveNoteListToTab(index: number, noteList: NoteList): void {
    const otherTab = this.cache.fetch(index)!;
    otherTab.noteLists ??= [];
    otherTab.noteLists.push(noteList);
    this.deleteNoteList(noteList);
    this.cache.save(index, otherTab);
    this.tabs[index] = otherTab;
  }

  moveTaskListToTab(index: number, taskList: TaskList): void {
    const otherTab = this.cache.fetch(index)!;
    otherTab.taskLists ??= [];
    otherTab.taskLists.push(taskList);
    this.deleteTaskList(taskList);
    this.cache.save(index, otherTab);
    this.tabs[index] = otherTab;
  }

  moveImageToTab(index: number, image: Image): void {
    const otherTab = this.cache.fetch(index)!;
    otherTab.images ??= [];
    otherTab.images.push(image);
    this.deleteImage(image);
    this.cache.save(index, otherTab);
    this.tabs[index] = otherTab;
  }

  setColorizedObjects(): void {
    this.colorizedObjects = [];
    this.tab.notes?.forEach(note => {
      if (!this.colorizedObjects.some(other => DataService.compareColors(note, other))) {
        this.colorizedObjects.push(note);
      }
    });
    this.tab.taskLists?.forEach(taskList => {
      if (!this.colorizedObjects.some(other => DataService.compareColors(taskList, other))) {
        this.colorizedObjects.push(taskList);
      }
    });
    this.tab.noteLists?.forEach(noteList => {
      if (!this.colorizedObjects.some(other => DataService.compareColors(noteList, other))) {
        this.colorizedObjects.push(noteList);
      }
      noteList.notes.forEach(note => {
        if (!this.colorizedObjects.some(other => DataService.compareColors(note, other))) {
          this.colorizedObjects.push(note);
        }
      });
    });
  }

  selectNextTab(revert: boolean): void {
    if (this.selectedTabIndex === 0 && revert) {
      return;
    }
    if (this.selectedTabIndex === (this.tabs.length - 1) && !revert) {
      return;
    }
    this.selectedTabIndex = revert ? this.selectedTabIndex - 1 : this.selectedTabIndex + 1;
  }

  selectNextItem(revert: boolean): void {
    const selectables: DraggableNote[] = this.getCurrentTabItems();

    const selectedIndizes = selectables
      .filter(x => x.selected)
      .map(x => selectables.indexOf(x));

    if (selectedIndizes.length === 0) {
      selectables[0].selected = true;
    } else if (selectedIndizes.length === 1) {
      const oldIndex = selectedIndizes[0];
      const newIndex = revert
        ? oldIndex === 0 ? selectables.length - 1 : oldIndex - 1
        : selectables.length - 1 === oldIndex ? 0 : oldIndex + 1;

      selectables[oldIndex].selected = false;
      selectables[newIndex].selected = true;
    } else {
      selectables.forEach(x => x.selected = false);
    }
  }

  /**
   * Gets all items ordered by index.
   */
  getCurrentTabItems(): DraggableNote[] {
    return [
      ...(this.tab.notes ?? []),
      ...(this.tab.taskLists ?? []),
      ...(this.tab.images ?? []),
      ...(this.tab.noteLists ?? [])
    ].sort((a, b) => (a.posZ ?? 0) - (b.posZ ?? 0))
  }

  getCurrentTabItem(id: string): DraggableNote | undefined {
    return this.getCurrentTabItems().find(x => x.id === id);
  }

  /**
   * Updates the connectedTo array of both objects.
   * Adds a connection when there was no before.
   * Removes the connection when they were connected before.
   * @param from
   * @param to
   */
  connect(from: DraggableNote, to: DraggableNote): void {
    if (!from.connectedTo?.includes(to.id)) {
      DataService.addConnection(from, to);
    } else {
      DataService.removeConnection(from, to);
    }

    this.cacheData();
  }

  private static addConnection(from: DraggableNote, to: DraggableNote): void {
    if (from.connectedTo === undefined) from.connectedTo = [to.id];
    else from.connectedTo.push(to.id);
    if (to.connectedTo === undefined) to.connectedTo = [from.id];
    else to.connectedTo.push(from.id);
  }

  private static removeConnection(from: DraggableNote, to: DraggableNote): void {
    if (from.connectedTo!.length === 1) from.connectedTo = undefined;
    else from.connectedTo = from.connectedTo!.filter(id => id !== to.id);
    if (to.connectedTo!.length === 1) to.connectedTo = undefined;
    else to.connectedTo = to.connectedTo!.filter(id => id !== from.id);
  }

  disconnectAll(target: DraggableNote): void {
    target.connectedTo?.forEach(id => {
      const item = this.getCurrentTabItem(id);
      if (item) {
        DataService.removeConnection(target, item);
      }
    })
    target.connectedTo = undefined;
    this.cacheData();
  }

  private defineIndex(item: DraggableNote): void {
    item.posZ ??= this.getNextIndex();
  }

  private reArrangeIndices(): void {
    let i = 1;
    this.getCurrentTabItems().forEach(item => item.posZ = i++);
  }

  private getNextIndex(): number {
    const items = this.getCurrentTabItems();
    const highestIndex = items[items.length - 1]?.posZ;
    return highestIndex ? highestIndex + 1 : 1;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
