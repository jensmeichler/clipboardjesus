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
import {_blank, isTauri} from "@clipboardjesus/const";
import {dialog} from "@tauri-apps/api";
import welcomeTab from '../../assets/screens/welcome.json';
import {Subject, takeUntil} from "rxjs";
import {Location} from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class DataService implements OnDestroy {
  _blank = _blank;

  private _selectedTabIndex = 0;
  get selectedTabIndex(): number { return this._selectedTabIndex; }
  set selectedTabIndex(index: number) {
    this._selectedTabIndex = index;
    this.updateAppTitle();
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
    private readonly fileAccessService: FileAccessService,
    private readonly clipboard: ClipboardService,
    private readonly location: Location,
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
   * Writes the current selected tab into the app title
   * and updates the query params.
   */
  updateAppTitle(): void {
    const appTitle = document.getElementById('title');
    if (!appTitle) {
      return;
    }

    const tab = this.tabs[this._selectedTabIndex];
    const tabName = tab.label ?? `#Board ${this._selectedTabIndex+1}`;
    appTitle.innerText = `Clip#board | ${tabName}`;

    //TODO: replaceState drops some warnings while routing...
    // The right way would be not to fool angular while setting the href manually.
    // When the route changes, the app title should change and not the other way around.
    const tabParam = tab.label ? tabName : (tab.index+1);
    this.location.replaceState('', `?tab=${tabParam}`);
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

  /**
   * @returns The total count of all items on the currently selected tab which are selected.
   */
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

  /**
   * Gets all draggable items where the user can specify a background color.
   * This method is mainly used get colors which can be copied to another item.
   * @param excludedItem
   */
  getColorizedObjects(excludedItem: Note | TaskList | NoteList): (Note | TaskList | NoteList)[] {
    return this.colorizedObjects.filter(item => !DataService.compareColors(excludedItem, item));
  }

  /**
   * Sets the selected property to {@link true} for all selectable items.
   * __Will just be applied for the currently selected tab!__
   */
  selectAll(): void {
    this.editAllItems(item => item.selected = true);
  }

  /**
   * Sets the selected property to {@link undefined} for all selectable items.
   * __Will just be applied for the currently selected tab!__
   */
  removeAllSelections(): void {
    this.editAllItems(item => item.selected = undefined);
  }

  /**
   * Applies the provided action to all items on the currently selected tab.
   * @param action
   */
  editAllSelectedItems(action: (item: DraggableNote) => void): void {
    this.editAllItems(x => x.selected ? action(x) : {})
  }

  /**
   * Executes the provided {@link action} for all draggable items of the currently selected tab.
   * @param action
   */
  editAllItems(action: (item: DraggableNote) => void): void {
    this.tab.notes?.forEach(action);
    this.tab.taskLists?.forEach(action);
    this.tab.images?.forEach(action);
    this.tab.noteLists?.forEach(action);
  }

  /**
   * Removes all items from the currently selected tab which do not meet the provided {@link condition}.
   * @param condition
   */
  filterAllItems(condition: (item: DraggableNote) => boolean): void {
    this.tab.notes = this.tab.notes?.filter(condition);
    this.tab.taskLists = this.tab.taskLists?.filter(condition);
    this.tab.images = this.tab.images?.filter(condition);
    this.tab.noteLists = this.tab.noteLists?.filter(condition);
  }

  /**
   * Save the tab and update the change history.
   * Updates the colorized objects array.
   */
  cacheData(): void {
    this.cache.save(this.selectedTabIndex, this.getAsJson(true));
    this.setColorizedObjects();
  }

  /**
   * Save all tabs and update the change history for each.
   * Updates the colorized objects array.
   */
  cacheAllData(): void {
    const currentTabIndex = this.selectedTabIndex;
    this.tabs.forEach(tab => {
      this.selectedTabIndex = tab.index;
      this.cache.save(this.selectedTabIndex, this.getAsJson(true));
    })
    this.selectedTabIndex = currentTabIndex;
    this.setColorizedObjects();
  }

  /**
   * Adds a new tab at the end and navigates towards it.
   * The provided index of the tab will be overwritten.
   * @param tab
   */
  addTab(tab?: Tab): void {
    if (tab) {
      tab.index = this.tabs.length;
    }
    const newTab: Tab = tab ?? {
      index: this.tabs.length,
      color: '#131313'
    };
    this.tabs.push(newTab);
    this.cache.save(newTab.index, newTab);
    this.selectedTabIndex = newTab.index;
  }

  /**
   * Applies the welcome page from the welcome page json.
   * Replaces a tutorial for the app.
   */
  addWelcomePage(): void {
    this._selectedTabIndex = 0;
    this.tab = welcomeTab;
    this.cache.save(0, welcomeTab);
  }

  /**
   * @returns Whether the clipboard contains text which can be parsed to draggable items.
   */
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

  /**
   * Imports all draggable items which can be parsed from the clipboard of the user.
   * If the clipboard is not parsable to a tab then a note with the clipboard text will be created.
   * __This method can cost some performance, so be carefully using it.__
   */
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

  /**
   * Sets the correct index property for all tabs.
   * @private
   */
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

  /**
   * Removes the selection of all items on the currently selected tab.
   */
  clearSelection(): void {
    this.editAllItems(item => item.selected = false);
    this.cacheData();
  }

  /**
   * Deletes all selected items on the currently selected tab.
   */
  deleteSelectedItems(): void {
    this.filterAllItems(item => !item.selected)
    this.cacheData();
  }

  /**
   * Removes all tabs and creates a fresh new one.
   */
  clearCache(): void {
    for (let i = 0; i < 20; i++) {
      this.cache.remove(i);
    }
    this.selectedTabIndex = 0;
    this.tabs = [];
    this.addTab();
  }

  /**
   * Adds the provided {@link note} to the tab.
   * @param note
   */
  addNote(note: Note): void {
    this.defineIndex(note);
    this.tab.notes ??= [];
    this.tab.notes.push(note);
    this.cacheData();
  }

  /**
   * Adds the provided {@link noteList} to the tab.
   * @param noteList
   */
  addNoteList(noteList: NoteList): void {
    this.defineIndex(noteList);
    this.tab.noteLists ??= [];
    this.tab.noteLists.push(noteList);
    this.cacheData();
  }

  /**
   * Adds the provided {@link taskList} to the tab.
   * @param taskList
   */
  addTaskList(taskList: TaskList): void {
    this.defineIndex(taskList);
    this.tab.taskLists ??= [];
    this.tab.taskLists.push(taskList);
    this.cacheData();
  }

  /**
   * Adds the provided {@link image} to the tab.
   * @param image
   */
  addImage(image: Image): void {
    this.defineIndex(image);
    this.tab.images ??= [];
    this.tab.images.push(image);
    this.cacheData();
  }

  /**
   * Deletes the provided {@link note} and removes all connections from other items.
   * @param note
   * @param skipIndexing Use this property when you do not want the indexes to be calculated again.
   *  This is sometimes needed when you want to replace a {@link Note}.
   */
  deleteNote(note: Note, skipIndexing?: boolean): void {
    this.disconnectAll(note);
    this.tab.notes = this.tab.notes?.filter(x => x !== note);
    if (!skipIndexing) {
      this.reArrangeIndices();
      this.cacheData();
    }
  }

  /**
   * Deletes the provided {@link taskList} and removes all connections from other items.
   * @param taskList
   * @param skipIndexing Use this property when you do not want the indexes to be calculated again.
   *  This is sometimes needed when you want to replace a {@link TaskList}.
   */
  deleteTaskList(taskList: TaskList, skipIndexing?: boolean): void {
    this.disconnectAll(taskList);
    this.tab.taskLists = this.tab.taskLists?.filter(x => x !== taskList);
    if (!skipIndexing) {
      this.reArrangeIndices();
      this.cacheData();
    }
  }

  /**
   * Deletes the provided {@link noteList} and removes all connections from other items.
   * @param noteList
   * @param skipIndexing Use this property when you do not want the indexes to be calculated again.
   *  This is sometimes needed when you want to replace a {@link NoteList}.
   */
  deleteNoteList(noteList: NoteList, skipIndexing?: boolean): void {
    this.disconnectAll(noteList);
    this.tab.noteLists = this.tab.noteLists?.filter(x => x !== noteList);
    if (!skipIndexing) {
      this.reArrangeIndices();
      this.cacheData();
    }
  }

  /**
   * Deletes the provided {@link image} and removes all connections from other items.
   * @param image
   */
  deleteImage(image: Image): void {
    this.disconnectAll(image);
    this.tab.images = this.tab.images?.filter(x => x !== image);
    this.reArrangeIndices();
    this.cacheData();
  }

  /**
   * Clones the tab with just the selected items on it.
   * @returns A clone of the currently selected tab with the currently selected items from that.
   */
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

  /**
   * Gets the currently selected items if any is selected.
   * If nothing is selected it gets the complete tab.
   * @param ignoreSelection
   */
  getAsJson(ignoreSelection?: boolean): Tab {
    if (ignoreSelection || !this.selectedItemsCount) {
      return this.tab;
    }
    return this.getSelectedItems();
  }

  /**
   * Sets all items from the provided {@link tab} onto the currently selected tab.
   * @param tab
   * @param skipCache
   */
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

    if (!skipCache) {
      this.cacheData();
    }
    this.reArrangeIndices();
  }

  /**
   * Opens the save as dialog where the user can specify the filename.
   * In the desktop version this will open an open-file-dialog.
   */
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
        if (filename) {
          await this.saveAll(filename);
        }
      });
    }
  }

  /**
   * Saves all tabs into a json file (*.boards.json) and downloads that file.
   * @param fileName
   */
  async saveAll(fileName?: string): Promise<void> {
    const json = this.cache.getJsonFromAll();
    const contents = JSON.stringify(json);
    if (isTauri) {
      fileName = fileName
        ? `${fileName.replace('.boards.json', '')}.boards.json`
        : undefined;
      if (await this.fileAccessService.write(contents, fileName)) {
        this.hashy.show(
          {text: 'SAVED_TABS_AS', interpolateParams: {savedAs: fileName}},
          5000,
          'OK'
        );
      } else {
        console.error(`Unable to access ${fileName}.`)
      }
    } else {
      const savedAs = this.fileService.save(contents, 'boards.json', fileName);
      this.hashy.show(
        {text: 'SAVED_TABS_AS', interpolateParams: {savedAs}},
        3000,
        'OK'
      );
    }
  }

  /**
   * Saves the current tab (Or the currently selected items) into the download folder of the user.
   * @param filename
   */
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

  /**
   * Set the z-index of the provided {@link item} to the highest value among items on the tab.
   * @param item
   */
  bringToFront(item: DraggableNote): void {
    item.posZ = this.getNextIndex();
    this.reArrangeIndices();
  }

  /**
   * Set the z-index of the provided {@link item} to next value and update the other items.
   * @param item
   */
  bringForward(item: DraggableNote): void {
    item.posZ! += 1.5;
    this.reArrangeIndices();
  }

  /**
   * Set the z-index of the provided {@link item} to value before and update the other items.
   * @param item
   */
  sendBackward(item: DraggableNote): void {
    item.posZ! -= 1.5;
    this.reArrangeIndices();
  }

  /**
   * Set the z-index of the provided {@link item} to the lowest value among items on the tab.
   * @param item
   */
  flipToBack(item: DraggableNote): void {
    item.posZ = 0;
    this.reArrangeIndices();
  }

  /**
   * Removes the provided {@link note} from the current tab
   * and creates it on the tab with the specified {@link index}.
   * @param index
   * @param note
   */
  moveNoteToTab(index: number, note: Note): void {
    const otherTab = this.cache.fetch(index)!;
    otherTab.notes ??= [];
    otherTab.notes.push(note);
    this.deleteNote(note);
    this.cache.save(index, otherTab);
    this.tabs[index] = otherTab;
  }

  /**
   * Removes the provided {@link noteList} from the current tab
   * and creates it on the tab with the specified {@link index}.
   * @param index
   * @param noteList
   */
  moveNoteListToTab(index: number, noteList: NoteList): void {
    const otherTab = this.cache.fetch(index)!;
    otherTab.noteLists ??= [];
    otherTab.noteLists.push(noteList);
    this.deleteNoteList(noteList);
    this.cache.save(index, otherTab);
    this.tabs[index] = otherTab;
  }

  /**
   * Removes the provided {@link taskList} from the current tab
   * and creates it on the tab with the specified {@link index}.
   * @param index
   * @param taskList
   */
  moveTaskListToTab(index: number, taskList: TaskList): void {
    const otherTab = this.cache.fetch(index)!;
    otherTab.taskLists ??= [];
    otherTab.taskLists.push(taskList);
    this.deleteTaskList(taskList);
    this.cache.save(index, otherTab);
    this.tabs[index] = otherTab;
  }

  /**
   * Removes the provided {@link image} from the current tab
   * and creates it on the tab with the specified {@link index}.
   * @param index
   * @param image
   */
  moveImageToTab(index: number, image: Image): void {
    const otherTab = this.cache.fetch(index)!;
    otherTab.images ??= [];
    otherTab.images.push(image);
    this.deleteImage(image);
    this.cache.save(index, otherTab);
    this.tabs[index] = otherTab;
  }

  /**
   * Sets the colorized objects array for the currently selected tab.
   */
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

  /**
   * Go to the next tab.
   * @param revert
   */
  selectNextTab(revert: boolean): void {
    if (this.selectedTabIndex === 0 && revert) {
      return;
    }
    if (this.selectedTabIndex === (this.tabs.length - 1) && !revert) {
      return;
    }
    this.selectedTabIndex = revert ? this.selectedTabIndex - 1 : this.selectedTabIndex + 1;
  }

  /**
   * Select the next draggable item.
   * @param revert
   */
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

  /**
   * Gets a draggable note via the provided {@link id}.
   * @param id
   * @returns {@link undefined} if not existing.
   */
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

  /**
   * Removes all connections from the given {@link target}
   * and the connections from other items towards it.
   * @param target
   */
  disconnectAll(target: DraggableNote): void {
    target.connectedTo?.forEach(id => {
      const item = this.getCurrentTabItem(id);
      if (item?.connectedTo?.length) {
        DataService.removeConnection(target, item);
      }
    })
    target.connectedTo = undefined;
    this.cacheData();
  }

  /**
   * Sets the z-index of the provided {@link item} to the next free index.
   * @param item
   * @private
   */
  private defineIndex(item: DraggableNote): void {
    item.posZ ??= this.getNextIndex();
  }

  /**
   * Recalculates the z-index for all items of the currently selected tab.
   * @private
   */
  private reArrangeIndices(): void {
    let i = 1;
    this.getCurrentTabItems().forEach(item => item.posZ = i++);
  }

  /**
   * @returns The next free index.
   * @private
   */
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
