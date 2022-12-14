import {Injectable} from '@angular/core';
import {Clipboard} from "@angular/cdk/clipboard";
import {isTauri} from "@clipboardjesus/const";
import {clipboard} from "@tauri-apps/api";

@Injectable({
  providedIn: 'root',
})
export class ClipboardService {
  constructor(private readonly clipboard: Clipboard) {}

  /**
   * Copies the provided text to the clipboard.
   * This function uses the __TAURI__ api if it was provided.
   * @param text The content which should be stored into the clipboard.
   */
  async set(text: string): Promise<void> {
    if (isTauri) {
      await clipboard.writeText(text);
    } else {
      this.clipboard.copy(text);
    }
  }

  /**
   * Reads the text from the clipboard async.
   * This function uses the __TAURI__ api if it was provided.
   * @returns The clipboard content.
   */
  get(): Promise<string | null> {
    if (isTauri) {
      return clipboard.readText();
    } else {
      return navigator.clipboard.readText();
    }
  }
}
