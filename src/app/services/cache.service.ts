import {Injectable} from '@angular/core';
import {Tab} from "@clipboardjesus/models";
import {RedoService, StorageService} from "@clipboardjesus/services";

@Injectable({
  providedIn: 'root',
})
export class CacheService {
  redoPossible = this.redoService.redoPossible;
  undoPossible = this.redoService.undoPossible;
  restorePossible = this.redoService.restorePossible;

  constructor(
    private readonly redoService: RedoService,
    private readonly storageService: StorageService,
  ) {
  }

  /**
   * Read the last state of the tab and write it into the localstorage.
   * @param index The index of the tab.
   */
  undo(index: number): boolean {
    return this.redoService.undo(index);
  }

  /**
   * Read the previous undone state of the tab and write it into the localstorage.
   * @param index The index of the tab.
   */
  redo(index: number): boolean {
    return this.redoService.redo(index);
  }

  /**
   * Recreate the last deleted tab.
   */
  recreate(): Tab | undefined {
    return this.redoService.recreate();
  }

  /**
   * Save the tab and update the change history.
   * @param index The index of the tab.
   * @param tab The content to save.
   */
  save(index: number, tab: Tab): void {
    this.redoService.do(index);

    const tabCopy = JSON.parse(JSON.stringify(tab)) as Tab;
    tabCopy.notes?.forEach(x => x.selected = undefined);
    tabCopy.taskLists?.forEach(x => x.selected = undefined);
    tabCopy.images?.forEach(x => x.selected = undefined);
    tabCopy.noteLists?.forEach(x => x.selected = undefined);

    this.storageService.setTab(tabCopy, index);
  }

  /**
   * Reads the tab from the localstorage.
   * @param index The index of the tab.
   * @returns the {@link Tab} which was stored.
   */
  fetch(index: number): Tab | undefined {
    return this.storageService.fetchTab(index);
  }

  /**
   * Delete the tab and update the change history.
   * @param index The index of the deleted tab.
   */
  remove(index: number): void {
    this.redoService.remove(index);
    this.storageService.deleteTab(index);
  }

  /**
   * Gets a {@link Tab} array of all currently available tabs.
   * The maximum size is 20.
   */
  getJsonFromAll(): Tab[] {
    const tabs: Tab[] = [];
    for (let i = 0; i < 20; i++) {
      const tab = this.fetch(i);
      if (tab) {
        this.setIdsForItemsWithout(tab);
        tab.index = i;
        tabs.push(tab);
      }
    }
    return tabs;
  }

  /**
   * Backwards compatibility for old items (Before all items had ids).
   * TODO: remove after February 2023
   */
  private setIdsForItemsWithout(tab: Tab): void {
    tab.notes?.forEach((item, index) =>
      item.id ??= `migrated-note-${index}`
    );
    tab.noteLists?.forEach((item, index) =>
      item.id ??= `migrated-note-list-${index}`
    );
    tab.taskLists?.forEach((item, index) =>
      item.id ??= `migrated-task-list-${index}`
    );
    tab.images?.forEach((item, index) =>
      item.id ??= `migrated-image-${index}`
    );
  }
}
