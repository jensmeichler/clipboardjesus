import {Injectable} from '@angular/core';
import {isTauri} from "@clipboardjesus/helpers";
import {clipboard} from "@tauri-apps/api";

/**
 * Provides the clipboard api for every supported environment.
 */
@Injectable({
  providedIn: 'root',
})
export class ClipboardService {
  /**
   * Copies the provided text to the clipboard.
   * This function uses the __TAURI__ api if it was provided.
   * @param text The content which should be stored into the clipboard.
   */
  async set(text: string): Promise<void> {
    if (isTauri) {
      await clipboard.writeText(text);
    } else {
      await navigator.clipboard.writeText(text);
    }
  }

  /**
   * Copies the provided file to the clipboard.
   * @param base64 The content which should be stored into the clipboard as base64 string.
   */
  async setFile(base64: string): Promise<boolean> {
    // JPEGs are not supported by the clipboard api,
    // so we have to convert them to PNGs
    if (base64.startsWith('data:image/jpeg;base64,')) {
      base64 = base64.replace('data:image/jpeg;base64,', 'data:image/png;base64,');
    }

    const response = await fetch(base64);
    const blob = await response.blob();
    try {
      await navigator.clipboard.write([
        new ClipboardItem({[blob.type]: blob})
      ]);
      return true;
    } catch {
      return false;
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

  /**
   * Reads the file from the clipboard async.
   * @returns The clipboard content.
   */
  async getImage(): Promise<File | false> {
    const items = await navigator.clipboard.read();
    for (const item of items) {
      if (!item.types.includes('image/png')
        && !item.types.includes('image/jpeg')) {
        continue;
      }
      const blob = await item.getType('image/png');
      return new File([blob], 'clipboard.png', {type: 'image/png'});
    }
    return false;
  }
}
