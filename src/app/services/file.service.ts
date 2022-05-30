import {Injectable} from '@angular/core';
import {FileSaverService} from "ngx-filesaver";
import {getTimeStamp} from "../const";

@Injectable({providedIn: 'root'})
export class FileService {
  constructor(private readonly fileSaverService: FileSaverService) {
  }

  save(content: string, fileType: string, filename?: string): string {
    filename ??= getTimeStamp();
    filename = filename.endsWith('.' + fileType) ? filename : filename + '.' + fileType;
    this.fileSaverService.saveText(content, filename);
    return filename;
  }
}
