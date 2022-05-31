import {Injectable} from '@angular/core';
import {Tab} from "../models";

@Injectable({providedIn: 'root'})
export class StorageService {
  fetchTab(index: number): Tab | undefined {
    const key = `clipboard_data_${index}`;
    const content = localStorage.getItem(key);
    if (!content) return;
    return JSON.parse(content) as Tab;
  }

  deleteTab(index: number): void {
    const key = `clipboard_data_${index}`;
    localStorage.removeItem(key);
  }

  setTab(tab: Tab, index: number): void {
    const key = `clipboard_data_${index}`;
    const content = JSON.stringify(tab);
    localStorage.setItem(key, content);
  }
}
