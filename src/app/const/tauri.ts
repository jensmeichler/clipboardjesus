import {TAURI} from "../models";

// @ts-ignore https://tauri.studio/v1/api/js/
export const __TAURI__: TAURI = window.__TAURI__;
export const __HREF__ = __TAURI__ ? '_tauri' : '_blank';
