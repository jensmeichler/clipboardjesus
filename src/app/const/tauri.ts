// @ts-ignore https://tauri.studio/v1/api/js/
export const isTauri = !!window.__TAURI__;
export const _blank = isTauri ? '_tauri' : '_blank';
