import {Injectable} from '@angular/core';

@Injectable({providedIn: 'root'})
export class FileAccessService {
  async read(path: string): Promise<string> {
    //TODO: implement
    return window.__TAURI__.fs.readTextFile(path);
  }

  write(content: string, path: string): void {
    //TODO: implement
    let file: FsTextFileOption;
  }
}
