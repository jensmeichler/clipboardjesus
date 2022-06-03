import {Injectable} from '@angular/core';
import {FileSaverService} from "ngx-filesaver";
import {getTimeStamp} from "../const";

@Injectable({providedIn: 'root'})
export class FileService {
  constructor(private readonly fileSaverService: FileSaverService) {}

  /**
   * Saves the content into the download folder of the user.
   * @param content The content of the file that will be saved.
   * @param fileType The file extension that will be appended to the filename.
   * @param filename The name of the saved file. It will be generated if filename is {@link undefined}.
   */
  save(content: string, fileType: string, filename?: string): string {
    filename ??= getTimeStamp();
    filename = filename.endsWith('.' + fileType) ? filename : filename + '.' + fileType;
    this.fileSaverService.saveText(content, filename);
    return filename;
  }
}
