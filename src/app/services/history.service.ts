import {Injectable} from '@angular/core';
import {Tab} from "@clipboardjesus/models";
import {BehaviorSubject, takeUntil} from "rxjs";
import {StorageService} from "@clipboardjesus/services/storage.service";
import {DisposableService} from "@clipboardjesus/services/disposable.service";

/**
 * The service that provides possibilities
 * to undo and redo actions.
 */
@Injectable({
  providedIn: 'root',
})
export class HistoryService extends DisposableService {
  /** Array of tab arrays which contains history information. */
  possibleUndos: Tab[][] = [];
  /** Array of tab arrays which contains history information. */
  possibleRedos: Tab[][] = [];
  /** Array of tabs which contains history information about deleted tabs. */
  possibleRestores: Tab[] = [];

  /** Whether the user can redo the last undone action. */
  undoPossible = new BehaviorSubject<boolean>(false);
  /** Whether the user can undo the last action. */
  redoPossible = new BehaviorSubject<boolean>(false);
  /** Whether the user can restore the lastly deleted tab. */
  restorePossible = new BehaviorSubject<boolean>(false);

  /**
   * Create an instance of the history service.
   */
  constructor(
    private readonly storageService: StorageService,
  ) {
    super();

    for (let i = 0; i < 20; i++) {
      // Initialize the arrays.
      this.possibleUndos.push([]);
      this.possibleRedos.push([]);
    }

    storageService.onTabChanged.pipe(takeUntil(this.destroy$)).subscribe(({index}) =>
      this.do(index)
    );
    storageService.onTabDeleted.pipe(takeUntil(this.destroy$)).subscribe((index) =>
      this.remove(index)
    );
  }

  /**
   * Save the tab into the undo history.
   * @param index The index of the tab.
   */
  do(index: number): void {
    const tab = this.storageService.fetchTab(index);
    if (tab) {
      this.possibleUndos[index].push(tab);
      this.possibleRedos[index] = [];
      this.updateHistory(index);
    }
  }

  /**
   * Read the last state of the tab and write it into the localstorage.
   * @param index The index of the tab.
   */
  undo(index: number): boolean {
    let success = false;
    if (this.possibleUndos[index].length) {
      const undoneTab = this.storageService.fetchTab(index);
      if (undoneTab) {
        this.possibleRedos[index].push(undoneTab);
        const undo = this.possibleUndos[index].pop()!;
        this.storageService.setTab(undo, index);
        success = true;
      }
    }

    this.updateHistory(index);
    return success;
  }

  /**
   * Read the previous undone state of the tab and write it into the localstorage.
   * @param index The index of the tab.
   */
  redo(index: number): boolean {
    let success = false;
    if (this.possibleRedos[index].length) {
      const redoneTab = this.storageService.fetchTab(index);
      if (redoneTab) {
        const redo = this.possibleRedos[index].pop()!;
        this.possibleUndos[index].push(redoneTab);
        this.storageService.setTab(redo, index);
        success = true;
      }
    }

    this.updateHistory(index);
    return success;
  }

  /**
   * Recreate the last deleted tab.
   */
  recreate(): Tab | undefined {
    const restoredTab = this.possibleRestores.pop();
    if (!this.possibleRestores.length) {
      this.restorePossible.next(false);
    }
    return restoredTab;
  }

  /**
   * Switches the undo and redo information from the provided tabs
   * @param left The index of the tab.
   * @param right The index of the other tab.
   */
  switchHistory(left: number, right: number): void {
    const leftUndos = this.possibleUndos[left].map(x => ({...x, index: right}));
    const rightUndos = this.possibleUndos[right].map(x => ({...x, index: left}));
    const leftRedos = this.possibleRedos[left].map(x => ({...x, index: right}));
    const rightRedos = this.possibleRedos[right].map(x => ({...x, index: left}));

    this.possibleUndos[left] = rightUndos;
    this.possibleUndos[right] = leftUndos;
    this.possibleRedos[left] = rightRedos;
    this.possibleRedos[right] = leftRedos;
  }

  /**
   * Store a deleted tab into the history.
   * @param index The index of the deleted tab.
   */
  remove(index: number): void {
    const tab = this.storageService.fetchTab(index);
    if (tab) {
      this.possibleRestores.push(tab);
      this.restorePossible.next(true);
    }
    this.possibleUndos[index] = [];
    this.possibleRedos[index] = [];
  }

  /**
   * Update the possibilities (e.g. undoPossible, redoPossible).
   * @param index The index of the deleted tab.
   */
  private updateHistory(index: number): void {
    if (!this.possibleUndos[index].length && this.undoPossible.getValue()) {
      this.undoPossible.next(false);
    } else if (this.possibleUndos[index].length && !this.undoPossible.getValue()) {
      this.undoPossible.next(true);
    }
    if (!this.possibleRedos[index].length && this.redoPossible.getValue()) {
      this.redoPossible.next(false);
    } else if (this.possibleRedos[index].length && !this.redoPossible.getValue()) {
      this.redoPossible.next(true);
    }
  }
}
