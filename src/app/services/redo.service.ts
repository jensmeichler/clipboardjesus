import {Injectable} from '@angular/core';
import {Tab} from "../models";
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class RedoService {
  possibleUndos: Tab[][] = [];
  possibleRedos: Tab[][] = [];

  undoPossible = new BehaviorSubject<boolean>(false);
  redoPossible = new BehaviorSubject<boolean>(false);

  constructor() {
    for (let i = 0; i < 20; i++) {
      this.possibleUndos.push([]);
      this.possibleRedos.push([]);
    }
  }

  do(index: number) {
    const key = "clipboard_data_" + index;
    const content = localStorage.getItem(key);
    if (content) {
      const tab = JSON.parse(content);
      this.possibleUndos[index].push(tab);
      this.possibleRedos[index] = [];
      this.updateRedoPossible(index);
    }
  }

  undo(index: number): boolean {
    let success = false;
    if (this.possibleUndos[index].length) {
      const key = "clipboard_data_" + index;
      const content = localStorage.getItem(key);
      if (content) {
        const undoneTab = JSON.parse(content);
        this.possibleRedos[index].push(undoneTab);

        const undo = this.possibleUndos[index].pop()!;
        const undoContent = JSON.stringify(undo);

        localStorage.setItem(key, undoContent);
        success = true;
      }
    }

    this.updateRedoPossible(index);
    return success;
  }

  redo(index: number): boolean {
    let success = false;
    if (this.possibleRedos[index].length) {
      const key = "clipboard_data_" + index;
      const content = localStorage.getItem(key);
      if (content) {
        const redo = this.possibleRedos[index].pop()!;

        const redoneTab = JSON.parse(localStorage.getItem(key)!);
        this.possibleUndos[index].push(redoneTab);

        const redoContent = JSON.stringify(redo);
        localStorage.setItem(key, redoContent);

        success = true;
      }
    }

    this.updateRedoPossible(index);
    return success;
  }

  remove(index: number) {
    this.possibleUndos[index] = [];
    this.possibleRedos[index] = [];
  }

  private updateRedoPossible(index: number) {
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
