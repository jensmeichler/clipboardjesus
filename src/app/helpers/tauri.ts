export const isTauri = '__TAURI__' in window;
export const _blank = isTauri ? '_tauri' : '_blank';
