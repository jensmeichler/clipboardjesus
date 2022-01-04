import {Injectable} from '@angular/core';
import {Tab} from "../models";

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  save(index: number, tab: Tab) {
    tab.notes?.forEach(x => x.selected = false);
    tab.taskLists?.forEach(x => x.selected = false);
    tab.images?.forEach(x => x.selected = false);

    const key = "clipboard_data_" + index;
    const content = JSON.stringify(tab);
    localStorage.setItem(key, content);
  }

  fetch(index: number) : Tab | null {
    const key = "clipboard_data_" + index;
    const data = localStorage.getItem(key);
    if (data) {
      return JSON.parse(data) as Tab;
    } else {
     return null;
    }
  }

  remove(index: number) {
    const key = "clipboard_data_" + index;
    localStorage.removeItem(key);
  }
}
