import {Injectable} from '@angular/core';
import {getTimeStamp} from "@clipboardjesus/const";

@Injectable({providedIn: 'root'})
export class FileService {
  /**
   * Saves the content into the download folder of the user.
   * @param content The content of the file that will be saved.
   * @param fileType The file extension that will be appended to the filename.
   * @param filename The name of the saved file. It will be generated if filename is {@link undefined}.
   */
  save(content: string, fileType: string, filename?: string): string {
    filename ??= getTimeStamp();
    filename = filename.endsWith('.' + fileType) ? filename : filename + '.' + fileType;
    this.saveText(content, filename);
    return filename;
  }

  private saveText(content: string, filename: string): void {
    //TODO implement
  }
}
