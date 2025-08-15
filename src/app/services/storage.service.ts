import {EventEmitter, Injectable} from '@angular/core';
import {Note, Tab} from "@clipboardjesus/models";
import {HashyService} from "@clipboardjesus/services/hashy.service";

/** The flag which will be set into the localstorage to prevent duplicate deletion of tabs. */
export const TAB_DELETION_FLAG = 'tab_deletion_from_other_tab';

/**
 * Service to handle all the actions that save data into the localStorage.
 */
@Injectable({
  providedIn: 'root',
})
export class StorageService {
  /** Event that fires when a tab was changed from another browser tab. */
  onTabChanged = new EventEmitter<{tab: Tab, index: number}>();
  /** Event that fires when a tab was deleted from another browser tab. */
  onTabDeleted = new EventEmitter<number>();
  /** Event that fires when an image was stored. */
  onImgStored = new EventEmitter<string>();

  /** Get the current tab index from the localStorage. */
  get selectedTabIndex(): number {
    return +(localStorage.getItem('clipboard_tab') ?? 0);
  }
  /** Save the current tab index in the localStorage. */
  set selectedTabIndex(index: number) {
    localStorage.setItem('clipboard_tab', index.toString());
  }

  /**
   * Create an instance of the storage service.
   */
  constructor(private readonly hashy: HashyService) {
    window.addEventListener('storage', ({oldValue, newValue, key}) => {
      const indexString = key?.split('_').reverse()[0];
      if (indexString === undefined) {
        return;
      }
      const index = +indexString;

      if (newValue) {
        // Tab was changed from other browser tab
        const tab: Tab = JSON.parse(newValue);
        this.onTabChanged.emit({tab, index});
      } else if (oldValue) {
        // Tab was deleted from other browser tab
        this.onTabDeleted.emit(index);
      }
    })
  }

  /**
   * Reads the tab from the localstorage.
   * @param index The index of the tab.
   * @returns the {@link Tab} which was stored.
   */
  fetchTab(index: number): Tab | undefined {
    const key = `clipboard_data_${index}`;
    const content = localStorage.getItem(key);
    if (!content) {
      return;
    }

    try {
      return JSON.parse(content) as Tab;
    } catch (error) {
      this.hashy.show('FAILED_TO_LOAD_TAB', 'OK');
      console.error('Failed to parse tab content from localStorage', error, content);

      // Try to restore as much as possible from the corrupted content.
      // The goal here is just to provide as much data as possible to the user.
      // This should never happen, but if it does, we want to handle it gracefully.
      const tab: Tab = {
        index: index,
        label: 'Corrupted Tab',
        color: '#ff0000',
        notes: [
          new Note(
            null,
            0,
            0,
            content,
            'Restored from corrupted data:',
          )
        ]
      }

      this.setTab(tab, index);
      return tab;
    }
  }

  /**
   * Removes the tab from the localstorage.
   * Also sets the {@link TAB_DELETION_FLAG} in the localstorage
   * so that the other browser windows know not to react on rearranging tab indexes.
   * @param index The index of the tab.
   */
  deleteTab(index: number): void {
    localStorage.setItem(TAB_DELETION_FLAG, 'true');
    const key = `clipboard_data_${index}`;
    localStorage.removeItem(key);
    setTimeout(() => localStorage.removeItem(TAB_DELETION_FLAG), 500);
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

  /**
   * Store an image into the localStorage.
   */
  storeImage(id: string, base64: string | ArrayBuffer | null): void {
    if (typeof base64 === 'string') {
      localStorage.setItem(`clipboard_img_${id}`, base64);
      this.onImgStored.emit(id);
    } else {
      console.error('failed to store image', id, base64);
    }
  }

  /**
   * Get the image with the provided {@param id} from the localStorage.
   */
  fetchImage(id: string): string | null {
    return localStorage.getItem(`clipboard_img_${id}`);
  }

  /**
   * Delete the image with the provided id from the localStorage.
   * @param id
   */
  deleteImage(id: string): void {
    localStorage.removeItem(`clipboard_img_${id}`);
  }
}
