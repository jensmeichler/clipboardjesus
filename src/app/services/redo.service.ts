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

  do(index: number): void {
    const tab = this.storageService.fetchTab(index);
    if (tab) {
      this.possibleUndos[index].push(tab);
      this.possibleRedos[index] = [];
      this.updateRedoPossible(index);
    }
  }

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

    this.updateRedoPossible(index);
    return success;
  }

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

    this.updateRedoPossible(index);
    return success;
  }

  recreate(): Tab | undefined {
    const restoredTab = this.possibleRestores.pop();
    if (!this.possibleRestores.length) {
      this.restorePossible.next(false);
    }
    return restoredTab;
  }

  remove(index: number): void {
    const tab = this.storageService.fetchTab(index);
    if (tab) {
      this.possibleRestores.push(tab);
      this.restorePossible.next(true);
    }
    this.possibleUndos[index] = [];
    this.possibleRedos[index] = [];
  }

  private updateRedoPossible(index: number): void {
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
