import {Injectable} from '@angular/core';
import {FsTextFileOption} from "@tauri-apps/api/fs";

@Injectable({providedIn: 'root'})
export class FileAccessService {
  loadedPath = '';

  async read(path: string): Promise<string> {
    this.loadedPath = path;
    // @ts-ignore https://tauri.studio/v1/api/js/modules/fs/
    return window.__TAURI__.fs.readTextFile(path);
  }

  write(contents: string, path?: string): void {
    path ??= this.loadedPath;
    const file: FsTextFileOption = {path, contents};
    // @ts-ignore https://tauri.studio/v1/api/js/modules/fs/
    window.__TAURI__.fs.writeFile(file);
  }
}
