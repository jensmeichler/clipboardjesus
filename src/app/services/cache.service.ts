import {Injectable} from '@angular/core';
import {Tab} from "../models";
import {Tabs} from "../models/tabs.model";

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  save(index: number, tab: Tab) {
    const tabCopy = JSON.parse(JSON.stringify(tab)) as Tab;

    tabCopy.notes?.forEach(x => x.selected = false);
    tabCopy.taskLists?.forEach(x => x.selected = false);
    tabCopy.images?.forEach(x => x.selected = false);

    const key = "clipboard_data_" + index;
    const content = JSON.stringify(tabCopy);
    localStorage.setItem(key, content);
  }

  fetch(index: number): Tab | null {
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

  getJsonFromAll(): string {
    let tabs: Tabs = {tabs: []} as Tabs;

    for (let i = 0; i < 20; i++) {
      const tab = this.fetch(i);
      if (tab) {
        tab.index = i;
        tabs.tabs.push(tab);
      }
    }

    return JSON.stringify(tabs);
  }
}
