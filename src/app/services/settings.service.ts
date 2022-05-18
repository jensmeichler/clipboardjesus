import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private storageKeys = {
    animationsDisabled: 'animations_disabled',
    language: 'language',
    fontFamily: 'font-family',
    fontStyle: 'font-style',
  };

  private _animationsDisabled: boolean;
  get animationsDisabled(): boolean { return this._animationsDisabled; }
  set animationsDisabled(value: boolean) {
    this._animationsDisabled = value;
    if (value) {
      localStorage.setItem(this.storageKeys.animationsDisabled, 'True');
      const cursor = document.getElementById('cursor');
      if (cursor) cursor.style.display = 'none';
    } else {
      localStorage.removeItem(this.storageKeys.animationsDisabled);
    }
  }

  private _language: string;
  get language(): string { return this._language; }
  set language(value: string) {
    this._language = value;
    if (value === 'en') {
      localStorage.removeItem(this.storageKeys.language);
    } else {
      localStorage.setItem(this.storageKeys.language, value);
    }
  }

  private _fontFamily: Font;
  get fontFamily(): Font { return this._fontFamily; }
  set fontFamily(value: Font) {
    this._fontFamily = value;
    if (value === 'Roboto') {
      localStorage.removeItem(this.storageKeys.fontFamily);
      SettingsService.setFontFamily('var(--font-family-roboto)');
    } else {
      localStorage.setItem(this.storageKeys.fontFamily, value);
      SettingsService.setFontFamily('var(--font-family-victor)');
    }
  }

  private _fontStyle: string;
  get fontStyle(): string { return this._fontStyle; }
  set fontStyle(value: string) {
    this._fontStyle = value;
    if (value === 'normal') {
      localStorage.removeItem(this.storageKeys.fontStyle);
    } else {
      localStorage.setItem(this.storageKeys.fontStyle, value);
    }
    SettingsService.setFontStyle(value);
  }

  constructor() {
    this._animationsDisabled = localStorage.getItem(this.storageKeys.animationsDisabled) === 'True';
    this._language = localStorage.getItem(this.storageKeys.language) ?? 'en';
    this._fontFamily = localStorage.getItem(this.storageKeys.fontFamily) as Font ?? 'Roboto';
    SettingsService.setFontFamily(this._fontFamily);
    this._fontStyle = localStorage.getItem(this.storageKeys.fontStyle) ?? 'normal';
    SettingsService.setFontStyle(this._fontStyle);
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

type Font = 'Victor Mono' | 'Roboto'
