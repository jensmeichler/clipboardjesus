import {Injectable} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {window as tauri} from "@tauri-apps/api";
import {isTauri} from "@clipboardjesus/helpers";

/** The boolean string value which is stored in the localstorage. */
const TRUE = 'True';

/**
 * The service which provides all the settings
 * which can be set at the settings icon in the top right corner.
 */
@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  /** Whether the app is currently wrapped in a tauri window. */
  isTauri: boolean;
  /** Whether the current platform is Windows. */
  isWindows: boolean;
  /** Whether the current platform is macOS. */
  isMacos: boolean;
  /** Whether the current platform is Linux. */
  isLinux: boolean;
  /** Whether the current version is the beta or production environment. */
  isBeta: boolean;

  /** All the keys to access the localStorage. */
  private storageKeys = {
    animationsDisabled: 'clipboard_disable_animations',
    language: 'clipboard_lang',
    fontFamily: 'clipboard_font_family',
    fontStyle: 'clipboard_font_style',
    lastLoadedFile: 'clipboard_last_loaded_file',
    alwaysOnTop: 'clipboard_always_on_top',
    dblClickMode: 'clipboard_dbl_click_mode',
    lightMode: 'clipboard_light_mode',
  };

  /** Backing field */
  private _alwaysOnTop!: boolean;
  /** Set whether the window should stay always on top (just for installed tauri app) */
  get alwaysOnTop(): boolean { return this._alwaysOnTop; }
  /** Get whether the window should stay always on top (just for installed tauri app) */
  set alwaysOnTop(value: boolean) {
    if (!isTauri) {
      return;
    }
    this._alwaysOnTop = value;
    (async () => await tauri.appWindow.setAlwaysOnTop(value))();
    if (value) {
      localStorage.setItem(this.storageKeys.alwaysOnTop, TRUE);
    } else {
      localStorage.removeItem(this.storageKeys.alwaysOnTop);
    }
  }

  /** Backing field */
  private _lastLoadedFilePath: string | undefined;
  /** Set the last loaded file path (Only for tauri) */
  get lastLoadedFilePath(): string | undefined { return this._lastLoadedFilePath; }
  /** Get the last loaded file path (Only for tauri) */
  set lastLoadedFilePath(value: string | undefined) {
    this._lastLoadedFilePath = value;
    if (value === undefined) {
      localStorage.removeItem(this.storageKeys.lastLoadedFile);
    } else {
      localStorage.setItem(this.storageKeys.lastLoadedFile, value);
    }
  }

  /** Backing field */
  private _animationsDisabled!: boolean;
  /** Get whether the animation are disabled by the user. */
  get animationsDisabled(): boolean { return this._animationsDisabled; }
  /** Set whether the animation should be disabled. */
  set animationsDisabled(value: boolean) {
    this._animationsDisabled = value;
    if (value) {
      const cursor = document.getElementById('cursor');
      if (cursor) {
        cursor.style.display = 'none';
      }
      localStorage.setItem(this.storageKeys.animationsDisabled, TRUE);
    } else {
      localStorage.removeItem(this.storageKeys.animationsDisabled);
    }
  }

  /** Backing field */
  private _language!: string;
  /** Get the app language. */
  get language(): string { return this._language; }
  /** Set the app language. */
  set language(value: string) {
    this._language = value;
    this.translate.setDefaultLang(value);
    document.documentElement.setAttribute("lang", value);
    if (value === 'en') {
      localStorage.removeItem(this.storageKeys.language);
    } else {
      localStorage.setItem(this.storageKeys.language, value);
    }
  }

  /** Backing field */
  private _fontFamily!: string;
  /** Get the app font family. */
  get fontFamily(): string { return this._fontFamily; }
  /** Set the app font family. */
  set fontFamily(value: string) {
    this._fontFamily = value;
    if (value === 'Roboto') {
      SettingsService.setFontFamily('var(--font-family-roboto)');
      localStorage.removeItem(this.storageKeys.fontFamily);
    } else if (value === 'Victor Mono') {
      SettingsService.setFontFamily('var(--font-family-victor)');
      localStorage.setItem(this.storageKeys.fontFamily, value);
    } else {
      SettingsService.setFontFamily(value);
      localStorage.setItem(this.storageKeys.fontFamily, value);
    }
  }

  /** Backing field */
  private _fontStyle!: string;
  /** Get the app font style. */
  get fontStyle(): string { return this._fontStyle; }
  /** Set the app font style. */
  set fontStyle(value: string) {
    this._fontStyle = value;
    SettingsService.setFontStyle(value);
    if (value === 'normal') {
      localStorage.removeItem(this.storageKeys.fontStyle);
    } else {
      localStorage.setItem(this.storageKeys.fontStyle, value);
    }
  }

  /** Backing field */
  private _dblClickMode!: boolean;
  /** Get whether the app is in double click mode.*/
  get dblClickMode(): boolean { return this._dblClickMode; }
  /** Set the app into double click mode. (Notes are created with double click) */
  set dblClickMode(value: boolean) {
    this._dblClickMode = value;
    if (value) {
      localStorage.setItem(this.storageKeys.dblClickMode, TRUE);
    } else {
      localStorage.removeItem(this.storageKeys.dblClickMode);
    }
  }

  /** Backing field */
  private _lightMode!: boolean;
  /** Get whether the app is in light mode.*/
  get lightMode(): boolean { return this._lightMode; }
  /** Set the app into light mode. (Default is dark) */
  set lightMode(value: boolean) {
    this._lightMode = value;
    if (value) {
      SettingsService.setTheme('light');
      localStorage.setItem(this.storageKeys.lightMode, TRUE);
    } else {
      SettingsService.setTheme('dark');
      localStorage.removeItem(this.storageKeys.lightMode);
    }
  }

  /**
   * Creates an instance of the settings service
   * and initializes all the values.
   */
  constructor(private readonly translate: TranslateService) {
    this.lastLoadedFilePath = localStorage.getItem(this.storageKeys.lastLoadedFile) ?? undefined;
    this.alwaysOnTop = localStorage.getItem(this.storageKeys.alwaysOnTop) === TRUE;
    this.animationsDisabled = localStorage.getItem(this.storageKeys.animationsDisabled) === TRUE;
    this.language = localStorage.getItem(this.storageKeys.language) ?? 'en';
    this.fontFamily = localStorage.getItem(this.storageKeys.fontFamily) ?? 'Roboto';
    this.fontStyle = localStorage.getItem(this.storageKeys.fontStyle) ?? 'normal';
    this.dblClickMode = localStorage.getItem(this.storageKeys.dblClickMode) === TRUE;
    this.lightMode = localStorage.getItem(this.storageKeys.lightMode) === TRUE;

    this.isBeta = !isTauri && !window.location.href.includes('clipboardjesus.com');
    this.isWindows = navigator.platform.indexOf('Win') > -1;
    this.isMacos = navigator.platform.indexOf('Mac') > -1;
    this.isLinux = !(this.isWindows || this.isMacos);
    this.isTauri = isTauri;
  }

  /**
   * Sets the font family value property of the styles.scss
   */
  private static setFontFamily(value: string): void {
    document.querySelector<HTMLElement>(':root')!
      .style.setProperty('--font-family', value);
  }

  /**
   * Sets the font style value property of the styles.scss
   */
  private static setFontStyle(value: string): void {
    document.querySelector<HTMLElement>(':root')!
      .style.setProperty('--font-style', value);
  }

  /**
   * Sets the font style value property of the styles.scss
   */
  private static setTheme(value: 'dark' | 'light'): void {
    document.querySelector<HTMLElement>(':root')!
      .setAttribute('theme', value);
  }
}
