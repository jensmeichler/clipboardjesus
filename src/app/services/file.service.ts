import {Injectable} from '@angular/core';
import {FileSaverService} from "ngx-filesaver";

@Injectable({providedIn: 'root'})
export class FileService {
  constructor(private readonly fileSaverService: FileSaverService) {
  }

  save(content: string, fileType: string, filename?: string): string {
    filename ??= FileService.getTimeStamp();
    filename = filename.endsWith('.' + fileType) ? filename : filename + '.' + fileType;
    this.fileSaverService.saveText(content, filename);
    return filename;
  }

  private static getTimeStamp(): string {
    const date = new Date();
    const yyyy = date.getFullYear();
    const MM = FileService.setLeadingZero(date.getMonth() + 1);
    const dd = FileService.setLeadingZero(date.getDate());
    const HH = FileService.setLeadingZero(date.getHours());
    const mm = FileService.setLeadingZero(date.getMinutes());
    const ss = FileService.setLeadingZero(date.getSeconds());
    return `${yyyy}-${MM}-${dd}_${HH}-${mm}-${ss}`;
  }

  private static setLeadingZero(value: number): string {
    return ('0' + value).slice(-2);
  }
}
