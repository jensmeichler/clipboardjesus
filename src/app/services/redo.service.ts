import {Injectable} from '@angular/core';
import {Tab} from "../models";
import {BehaviorSubject} from "rxjs";
import {StorageService} from "./storage.service";

@Injectable({providedIn: 'root'})
export class RedoService {
  possibleUndos: Tab[][] = [];
  possibleRedos: Tab[][] = [];
  possibleRestores: Tab[] = [];

  undoPossible = new BehaviorSubject<boolean>(false);
  redoPossible = new BehaviorSubject<boolean>(false);
  restorePossible = new BehaviorSubject<boolean>(false);

  constructor(private readonly storageService: StorageService) {
    for (let i = 0; i < 20; i++) {
      this.possibleUndos.push([]);
      this.possibleRedos.push([]);
    }
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
