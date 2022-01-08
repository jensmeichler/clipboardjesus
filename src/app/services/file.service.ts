import {Injectable} from '@angular/core';
import * as moment from "moment";

@Injectable({
  providedIn: 'root'
})
export class FileService {
  save(content: string, fileType: string, filename?: string): string {
    filename ??= moment(new Date()).format('YYYY-MM-DD-HH-mm');
    filename = filename.endsWith('.' + fileType) ? filename : filename + '.' + fileType

    let a = document.createElement('a');
    let file = new Blob([content], {type: 'application/json'});
    a.href = URL.createObjectURL(file);
    a.download = filename;
    a.click();
    return filename;
  }
}
