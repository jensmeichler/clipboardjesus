import {Injectable} from '@angular/core';
import * as moment from "moment";
import {FileSaverService} from "ngx-filesaver";

@Injectable({
  providedIn: 'root'
})
export class FileService {
  constructor(private readonly fileSaverService: FileSaverService) {
  }

  save(content: string, fileType: string, filename?: string): string {
    filename ??= moment(new Date()).format('YYYY-MM-DD-HH-mm');
    filename = filename.endsWith('.' + fileType) ? filename : filename + '.' + fileType

    this.fileSaverService.saveText(content, filename);

    return filename;
  }
}
