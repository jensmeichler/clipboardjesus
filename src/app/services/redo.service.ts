import {Injectable} from '@angular/core';
import {Tab} from "../models";

@Injectable({
  providedIn: 'root'
})
export class RedoService {
  private possibleUndos: Tab[][] = [];
  private possibleRedos: Tab[][] = [];

  constructor() {
    for (let i = 0; i < 20; i++) {
      this.possibleUndos.push([]);
      this.possibleRedos.push([]);
    }
  }

  do(index: number) {
    const key = "clipboard_data_" + index;
    const tab = JSON.parse(localStorage.getItem(key)!);
    this.possibleUndos[index].push(tab);
    this.possibleRedos[index] = [];
  }

  undo(index: number): boolean {
    if (this.possibleUndos[index].length) {
      const key = "clipboard_data_" + index;

      const undoneTab = JSON.parse(localStorage.getItem(key)!);
      this.possibleRedos[index].push(undoneTab);

      const undo = this.possibleUndos[index].pop()!;
      const content = JSON.stringify(undo);
      localStorage.setItem(key, content);
      return true;
    }
    return false;
  }

  redo(index: number): boolean {
    if (this.possibleRedos[index].length) {
      const key = "clipboard_data_" + index;

      const redo = this.possibleRedos[index].pop()!;

      const redoneTab = JSON.parse(localStorage.getItem(key)!);
      this.possibleUndos[index].push(redoneTab);

      const content = JSON.stringify(redo);
      localStorage.setItem(key, content);
      return true;
    }
    return false;
  }

  remove(index: number) {
    this.possibleUndos[index] = [];
    this.possibleRedos[index] = [];
  }
}
