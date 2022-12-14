import {Injectable} from '@angular/core';
import {FsTextFileOption} from "@tauri-apps/api/fs";
import {HashyService, SettingsService} from "@clipboardjesus/services";
import {isTauri} from "@clipboardjesus/const";
import {fs} from "@tauri-apps/api";

@Injectable({
  providedIn: 'root',
})
export class FileAccessService {
  constructor(
    private readonly hashy: HashyService,
    private readonly settings: SettingsService
  ) {}

  /**
   * Reads the file contents from the given Path.
   * Remember that the path that is provided must be selected by the user.
   * If not the method will fail.
   * @param path
   * @returns The file contents as string or undefined if __TAURI__ was not provided
   */
  async read(path: string): Promise<string | undefined> {
    if (!isTauri) {
      return;
    }
    try {
      const contents = await fs.readTextFile(path);
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
    if (!isTauri) {
      return false;
    }
    path ??= this.settings.lastLoadedFilePath;
    if (!path) {
      return false;
    }

    const file: FsTextFileOption = {path, contents};
    try {
      await fs.writeFile(file);
      return true;
    } catch {
      return false;
    }
  }
}
