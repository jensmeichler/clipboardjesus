import {EventEmitter, Injectable} from '@angular/core';
import {Tab} from "@clipboardjesus/models";

@Injectable({providedIn: 'root'})
export class StorageService {
  onTabChanged = new EventEmitter<{tab: Tab, index: number}>();
  onTabDeleted = new EventEmitter<number>();

  constructor() {
    window.addEventListener('storage', ({oldValue, newValue, key}) => {
      const index = key?.split('_').reverse()[0];
      if (index === undefined) return;
      if (newValue) {
        // Tab was changed from other browser tab
        const tab: Tab = JSON.parse(newValue);
        this.onTabChanged.emit({tab, index: +index});
      } else if (oldValue) {
        // Tab was deleted from other browser tab
        this.onTabDeleted.emit(+index);
      }
    })
  }

  /**
   * Reads the tab from the localstorage.
   * @param index The index of the tab.
   * @returns the {@link Tab} which was stored.
   */
  fetchTab(index: number): Tab | undefined {debugger
    const key = `clipboard_data_${index}`;
    const content = localStorage.getItem(key);
    if (!content) return;
    return JSON.parse(content) as Tab;
  }

  /**
   * Removes the tab from the localstorage.
   * @param index The index of the tab.
   */
  deleteTab(index: number): void {debugger
    const key = `clipboard_data_${index}`;
    localStorage.removeItem(key);
  }

  /**
   * Saves the tab into the localstorage.
   * @param tab The tab content which should be stored.
   * @param index The index of the tab.
   */
  setTab(tab: Tab, index: number): void {debugger
    const key = `clipboard_data_${index}`;
    const content = JSON.stringify(tab);
    localStorage.setItem(key, content);
  }
}
