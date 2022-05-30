import {FsOptions, FsTextFileOption} from "@tauri-apps/api/fs";
import {OpenDialogOptions, SaveDialogOptions} from "@tauri-apps/api/dialog";

export type TAURI = {
  fs: {
    /* @see {@link https://tauri.studio/v1/api/js/modules/fs} */
    readTextFile(filePath: string, options?: FsOptions): Promise<string>,
    writeFile(file: FsTextFileOption, options?: FsOptions): Promise<void>,
  },
  path: {
    /* @see {@link https://tauri.studio/v1/api/js/modules/path} */
    dataDir(): Promise<string>
  },
  dialog: {
    /* @see {@link https://tauri.studio/v1/api/js/modules/dialog} */
    open(options?: OpenDialogOptions): Promise<null | string | string[]>,
    save(options?: SaveDialogOptions): Promise<string>
  }
}
