import {Injectable} from '@angular/core';

@Injectable({providedIn: 'root'})
export class FileAccessService {
  read(path: string): string {
    //TODO: implement
    return '';
  }

  write(content: string, path: string): void {
    //TODO: implement
    return;
  }
}
