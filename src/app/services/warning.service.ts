import {Injectable} from '@angular/core';
import {Tab} from "@clipboardjesus/models";

/**
 * Provides information about the warnings and errors of all tabs.
 */
@Injectable({
  providedIn: 'root',
})
export class WarningService {
  /** A key value pair of tab indexes for tabs which contain errors. */
  private _tabsWithErrors: {[key: number]: string[]} = {};

  /** A key value pair of tab indexes for tabs which contain warnings. */
  private _tabsWithWarnings: {[key: number]: string[]} = {};

  /**
   * Get information about the tab with the provided {@param tabIndex}.
   * @returns Whether the tab with the provided index has at least one draggable with errors.
   */
  hasError(tabIndex: number): boolean {
    return Object.keys(this._tabsWithErrors).includes(tabIndex.toString());
  }

  /**
   * Sets an error for the item with the provided id.
   */
  setError(noteId: string, allTabs: Tab[]) {
    const tab = allTabs.find(t => t.notes?.some(n => n.id === noteId));
    this._tabsWithErrors[tab!.index] ??= [];
    this._tabsWithErrors[tab!.index].push(noteId);
  }

  /**
   * Removes the error for the item with the provided id.
   */
  removeError(noteId: string, allTabs: Tab[]) {
    const tab = allTabs.find(t => t.notes?.some(n => n.id === noteId));
    if (!tab) {
      return;
    }
    const indexes = this._tabsWithErrors[tab.index]?.filter(x => x !== noteId);
    if (indexes?.length) {
      this._tabsWithErrors[tab.index] = indexes;
    } else {
      delete this._tabsWithErrors[tab.index];
    }
  }

  /**
   * Get information about the tab with the provided {@param tabIndex}.
   * @returns Whether the tab with the provided index has at least one draggable with warnings.
   */
  hasWarning(tabIndex: number): boolean {
    return Object.keys(this._tabsWithWarnings).includes(tabIndex.toString());
  }

  /**
   * Sets a warning for the item with the provided id.
   */
  setWarning(noteId: string, allTabs: Tab[]) {
    const tab = allTabs.find(t => t.notes?.some(n => n.id === noteId));
    this._tabsWithWarnings[tab!.index] ??= [];
    this._tabsWithWarnings[tab!.index].push(noteId);
  }

  /**
   * Removes the warning for the item with the provided id.
   */
  removeWarning(noteId: string, allTabs: Tab[]) {
    const tab = allTabs.find(t => t.notes?.some(n => n.id === noteId));
    if (!tab) {
      return;
    }
    const indexes = this._tabsWithWarnings[tab.index]?.filter(x => x !== noteId);
    if (indexes?.length) {
      this._tabsWithWarnings[tab.index] = indexes;
    } else {
      delete this._tabsWithWarnings[tab.index];
    }
  }

  /**
   * Switches the keys of the tabs with warnings and errors.
   */
  switchWarningsAndErrors(sourceIndex: number, targetIndex: number): void {
    const sourceWarnings = [...(this._tabsWithWarnings[sourceIndex] ?? [])];
    const sourceErrors = [...(this._tabsWithErrors[sourceIndex] ?? [])];
    const targetWarnings = [...(this._tabsWithWarnings[targetIndex] ?? [])];
    const targetErrors = [...(this._tabsWithErrors[targetIndex] ?? [])];
    if (targetWarnings.length) this._tabsWithWarnings[sourceIndex] = targetWarnings;
    else delete this._tabsWithWarnings[sourceIndex];
    if (targetErrors.length) this._tabsWithErrors[sourceIndex] = targetErrors;
    else delete this._tabsWithErrors[sourceIndex];
    if (sourceWarnings.length) this._tabsWithWarnings[targetIndex] = sourceWarnings;
    else delete this._tabsWithWarnings[targetIndex];
    if (sourceErrors.length) this._tabsWithErrors[targetIndex] = sourceErrors;
    else delete this._tabsWithErrors[targetIndex];
  }
}
