import {Injectable} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {window} from "@tauri-apps/api";
import {isTauri} from "../const";

const TRUE = 'True';
type Font = 'Victor Mono' | 'Roboto';

@Injectable({providedIn: 'root'})
export class SettingsService {
  private storageKeys = {
    animationsDisabled: 'animations_disabled',
    language: 'language',
    fontFamily: 'font-family',
    fontStyle: 'font-style',
    lastLoadedFile: 'file-path',
    alwaysOnTop: 'always-on-top'
  };

  private _alwaysOnTop!: boolean;
  get alwaysOnTop(): boolean { return this._alwaysOnTop; }
  set alwaysOnTop(value: boolean) {
    if (!isTauri) return;
    this._alwaysOnTop = value;
    (async () => await window.appWindow.setAlwaysOnTop(value))();
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

  constructor(private readonly translate: TranslateService) {
    this.lastLoadedFilePath = localStorage.getItem(this.storageKeys.lastLoadedFile) ?? undefined;
    this.alwaysOnTop = localStorage.getItem(this.storageKeys.alwaysOnTop) === TRUE;
    this.animationsDisabled = localStorage.getItem(this.storageKeys.animationsDisabled) === TRUE;
    this.language = localStorage.getItem(this.storageKeys.language) ?? 'en';
    this.fontFamily = localStorage.getItem(this.storageKeys.fontFamily) as Font ?? 'Roboto';
    this.fontStyle = localStorage.getItem(this.storageKeys.fontStyle) ?? 'normal';
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
