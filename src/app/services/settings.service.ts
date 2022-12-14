import {Injectable} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {window as tauri} from "@tauri-apps/api";
import {isTauri} from "@clipboardjesus/const";

const TRUE = 'True';
type Font = 'Victor Mono' | 'Roboto';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  isTauri: boolean;
  isWindows: boolean;
  isMacos: boolean;
  isLinux: boolean;
  isBeta: boolean;

  private storageKeys = {
    animationsDisabled: 'clipboard_disable_animations',
    language: 'clipboard_lang',
    fontFamily: 'clipboard_font_family',
    fontStyle: 'clipboard_font_style',
    lastLoadedFile: 'clipboard_last_loaded_file',
    alwaysOnTop: 'clipboard_always_on_top',
    dblClickMode: 'clipboard_dbl_click_mode',
  };

  private _alwaysOnTop!: boolean;
  get alwaysOnTop(): boolean { return this._alwaysOnTop; }
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

  private _lastLoadedFilePath: string | undefined;
  get lastLoadedFilePath(): string | undefined { return this._lastLoadedFilePath; }
  set lastLoadedFilePath(value: string | undefined) {
    this._lastLoadedFilePath = value;
    if (value === undefined) {
      localStorage.removeItem(this.storageKeys.lastLoadedFile);
    } else {
      localStorage.setItem(this.storageKeys.lastLoadedFile, value);
    }
  }

  private _animationsDisabled!: boolean;
  get animationsDisabled(): boolean { return this._animationsDisabled; }
  set animationsDisabled(value: boolean) {
    this._animationsDisabled = value;
    if (value) {
      const cursor = document.getElementById('cursor');
      if (cursor) cursor.style.display = 'none';
      localStorage.setItem(this.storageKeys.animationsDisabled, TRUE);
    } else {
      localStorage.removeItem(this.storageKeys.animationsDisabled);
    }
  }

  private _language!: string;
  get language(): string { return this._language; }
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

  private _fontFamily!: Font;
  get fontFamily(): Font { return this._fontFamily; }
  set fontFamily(value: Font) {
    this._fontFamily = value;
    if (value === 'Roboto') {
      SettingsService.setFontFamily('var(--font-family-roboto)');
      localStorage.removeItem(this.storageKeys.fontFamily);
    } else {
      SettingsService.setFontFamily('var(--font-family-victor)');
      localStorage.setItem(this.storageKeys.fontFamily, value);
    }
  }

  private _fontStyle!: string;
  get fontStyle(): string { return this._fontStyle; }
  set fontStyle(value: string) {
    this._fontStyle = value;
    SettingsService.setFontStyle(value);
    if (value === 'normal') {
      localStorage.removeItem(this.storageKeys.fontStyle);
    } else {
      localStorage.setItem(this.storageKeys.fontStyle, value);
    }
  }

  private _dblClickMode!: boolean;
  get dblClickMode(): boolean { return this._dblClickMode; }
  set dblClickMode(value: boolean) {
    this._dblClickMode = value;
    if (value) {
      localStorage.setItem(this.storageKeys.fontStyle, TRUE);
    } else {
      localStorage.removeItem(this.storageKeys.fontStyle);
    }
  }

  constructor(private readonly translate: TranslateService) {
    this.lastLoadedFilePath = localStorage.getItem(this.storageKeys.lastLoadedFile) ?? undefined;
    this.alwaysOnTop = localStorage.getItem(this.storageKeys.alwaysOnTop) === TRUE;
    this.animationsDisabled = localStorage.getItem(this.storageKeys.animationsDisabled) === TRUE;
    this.language = localStorage.getItem(this.storageKeys.language) ?? 'en';
    this.fontFamily = localStorage.getItem(this.storageKeys.fontFamily) as Font ?? 'Roboto';
    this.fontStyle = localStorage.getItem(this.storageKeys.fontStyle) ?? 'normal';
    this.dblClickMode = localStorage.getItem(this.storageKeys.dblClickMode) === TRUE;

    this.isBeta = !isTauri && !window.location.href.includes('clipboardjesus.com');
    this.isWindows = navigator.platform.indexOf('Win') > -1;
    this.isMacos = navigator.platform.indexOf('Mac') > -1;
    this.isLinux = !(this.isWindows || this.isMacos);
    this.isTauri = isTauri;
  }

  private static setFontFamily(value: string): void {
    (document.querySelector(':root') as any)
      .style.setProperty('--font-family', value);
  }

  private static setFontStyle(value: string): void {
    (document.querySelector(':root') as any)
      .style.setProperty('--font-style', value);
  }
}
