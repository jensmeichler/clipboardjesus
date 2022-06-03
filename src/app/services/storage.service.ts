import {Injectable} from '@angular/core';
import {Tab} from "../models";

@Injectable({providedIn: 'root'})
export class StorageService {
  /**
   * Reads the tab from the localstorage.
   * @param index The index of the tab.
   * @returns the {@link Tab} which was stored.
   */
  fetchTab(index: number): Tab | undefined {
    const key = `clipboard_data_${index}`;
    const content = localStorage.getItem(key);
    if (!content) return;
    return JSON.parse(content) as Tab;
  }

  /**
   * Removes the tab from the localstorage.
   * @param index The index of the tab.
   */
  deleteTab(index: number): void {
    const key = `clipboard_data_${index}`;
    localStorage.removeItem(key);
  }

  /**
   * Saves the tab into the localstorage.
   * @param tab The tab content which should be stored.
   * @param index The index of the tab.
   */
  setTab(tab: Tab, index: number): void {
    const key = `clipboard_data_${index}`;
    const content = JSON.stringify(tab);
    localStorage.setItem(key, content);
  }
}
