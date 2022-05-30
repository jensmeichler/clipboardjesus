import {Injectable} from '@angular/core';
import {FsTextFileOption} from "@tauri-apps/api/fs";
import {HashyService} from "./hashy.service";
import {__TAURI__, getTimeStamp} from "../const";

@Injectable({providedIn: 'root'})
export class FileAccessService {
  _dataDir?: string;
  get dataDir(): Promise<string> {
    return this._dataDir
      ? Promise.resolve(this._dataDir)
      : __TAURI__.path.dataDir();
  }

  loadedFileName = '';

  constructor(private readonly hashy: HashyService) {
  }

  async read(path: string): Promise<string | undefined> {
    if (!__TAURI__) return;
    try {
      const contents = await __TAURI__.fs.readTextFile(path);
      this.loadedFileName = path;
      return contents;
    } catch {
      return;
    }
  }

  async write(contents: string, options?: { fileType: string, fileName?: string }): Promise<boolean> {
    if (!__TAURI__) return false;
    const fileName = options
      ? `${options.fileName ?? getTimeStamp()}.${options.fileType}`
      : this.loadedFileName;

    const dataDir = await this.dataDir;
    const file: FsTextFileOption = {path: `${dataDir}${fileName}`, contents};
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
