import {Injectable} from '@angular/core';
import {FsTextFileOption} from "@tauri-apps/api/fs";
import {HashyService} from "./hashy.service";
import {TAURI} from "../models";
import {getTimeStamp} from "../const/time-stamps";

@Injectable({providedIn: 'root'})
export class FileAccessService {
  loadedFileName = '';

  constructor(private readonly hashy: HashyService) {
  }

  get __TAURI__(): TAURI | undefined {
    // @ts-ignore https://tauri.studio/v1/api/js/
    return window.__TAURI__;
  }

  async read(path: string): Promise<string | undefined> {
    if (!this.__TAURI__) return;
    try {
      const contents = await this.__TAURI__.fs.readTextFile(path);
      this.loadedFileName = path;
      return contents;
    } catch {
      return;
    }
  }

  async write(contents: string, options?: { fileType: string, fileName?: string }): Promise<boolean> {
    if (!this.__TAURI__) return false;
    const fileName = options
      ? `${options.fileName ?? getTimeStamp()}.${options.fileType}`
      : this.loadedFileName;

    const dataDir = await this.__TAURI__.path.dataDir();
    const file: FsTextFileOption = {path: `${dataDir}${fileName}`, contents};
    try {
      await this.__TAURI__.fs.writeFile(file);
      //TODO: localize
      this.hashy.show(`Saved as ${file.path}`, 2000, 'OK');
      return true;
    } catch(error: any) {
      this.hashy.show(error.toString(), 9999, 'OK');
      return false;
    }
  }
}
