import {FsOptions, FsTextFileOption} from "@tauri-apps/api/fs";

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
}
