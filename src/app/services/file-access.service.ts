import {Injectable} from '@angular/core';
import {FsTextFileOption} from "@tauri-apps/api/fs";

@Injectable({providedIn: 'root'})
export class FileAccessService {
  async read(path: string): Promise<string> {
    return window.__TAURI__.fs.readTextFile(path);
  }

  write(contents: string, path: string): void {
    const file: FsTextFileOption = {path, contents};
    window.__TAURI__.fs.writeFile(file);
  }
}
