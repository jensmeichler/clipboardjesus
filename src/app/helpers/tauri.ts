/**
 * Get information about the current environment.
 * @returns Whether the app is started in an installed tauri app.
 */
export const isTauri = '__TAURI__' in window;

/**
 * Get the _blank string.
 * @returns The _blank string. For tauri you need to provide _tauri to open a link in a new tab.
 */
export const _blank = isTauri ? '_tauri' : '_blank';
