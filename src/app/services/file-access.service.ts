import {Injectable} from '@angular/core';
import {FsTextFileOption} from "@tauri-apps/api/fs";
import {HashyService} from "./hashy.service";
import {SettingsService} from "./settings.service";
import {__TAURI__} from "../const";

@Injectable({providedIn: 'root'})
export class FileAccessService {
  constructor(
    private readonly hashy: HashyService,
    private readonly settings: SettingsService
  ) {
  }

  /**
   * Reads the file contents from the given Path.
   * Remember that the path that is provided must be selected by the user.
   * If not the method will fail.
   * @param path
   * @returns The file contents as string or undefined if __TAURI__ was not provided
   */
  async read(path: string): Promise<string | undefined> {
    if (!__TAURI__) return;
    try {
      const contents = await __TAURI__.fs.readTextFile(path);
      this.settings.lastLoadedFilePath = path;
      return contents;
    } catch {
      return;
    }
  }

  /**
   * Try to write the contents into the last loaded filePath
   * @param contents The content as string, which should be stored
   * @param path Override to skip the lastLoadedFilePath
   * @returns {false} if __TAURI__ is not specified or save file was not done successfully
   */
  async write(contents: string, path?: string): Promise<boolean> {
    if (!__TAURI__) return false;
    path ??= this.settings.lastLoadedFilePath;
    if (!path) {
      return false;
    }

    const file: FsTextFileOption = {path, contents};
    try {
      await __TAURI__.fs.writeFile(file);
      this.hashy.show(`Saved as ${file.path}`, 5000, 'OK');
      return true;
    } catch {
      return false;
    }
  }
}
