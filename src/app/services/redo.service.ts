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
    this.log('do:before');

    const key = "clipboard_data_" + index;
    const tab = JSON.parse(localStorage.getItem(key)!);
    this.possibleUndos[index].push(tab);
    this.possibleRedos[index] = [];

    this.log('do:after');
  }

  undo(index: number): boolean {
    this.log('undo:before');

    if (this.possibleUndos[index].length) {
      const key = "clipboard_data_" + index;

      const undoneTab = JSON.parse(localStorage.getItem(key)!);
      this.possibleRedos[index].push(undoneTab);

      const undo = this.possibleUndos[index].pop()!;
      const content = JSON.stringify(undo);
      localStorage.setItem(key, content);

      this.log('undo:after');

      return true;
    }
    return false;
  }

  redo(index: number): boolean {
    this.log('redo:before');

    if (this.possibleRedos[index].length) {
      const key = "clipboard_data_" + index;

      const redo = this.possibleRedos[index].pop()!;

      const redoneTab = JSON.parse(localStorage.getItem(key)!);
      this.possibleUndos[index].push(redoneTab);

      const content = JSON.stringify(redo);
      localStorage.setItem(key, content);

      this.log('redo:after');

      return true;
    }
    return false;
  }

  remove(index: number) {
    this.possibleUndos[index] = [];
    this.possibleRedos[index] = [];
  }

  private log(method: string) {
    console.log(method, 'undos: ' +
      this.possibleUndos[0].length + '-' +
      this.possibleUndos[1].length + '-' +
      this.possibleUndos[2].length + ' | redos: ' +
      this.possibleRedos[0].length + '-' +
      this.possibleRedos[1].length + '-' +
      this.possibleRedos[2].length);
  }
}
