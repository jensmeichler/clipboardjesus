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

  async write(contents: string, path?: string): Promise<boolean> {
    if (!__TAURI__) return false;
    path ??= this.settings.lastLoadedFilePath;
    if (!path) {
      //TODO: localize
      this.hashy.show('No path was provided', 5000, 'OK');
      return false;
    }

    const file: FsTextFileOption = {path, contents};
    try {
      await __TAURI__.fs.writeFile(file);
      //TODO: localize
      this.hashy.show(`Saved as ${file.path}`, 5000, 'OK');
      return true;
    } catch(error: any) {
      this.hashy.show(error.toString(), 9999, 'OK');
      return false;
    }
  }
}
