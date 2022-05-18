import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  storageKeys = {
    animationsDisabled: 'animations_disabled',
    language: 'language',
    font: 'font-family'
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

  private _font: Font;
  get font(): Font { return this._font; }
  set font(value: Font) {
    this._font = value;
    if (value === 'Roboto') {
      localStorage.removeItem(this.storageKeys.font);
      SettingsService.setFontFamily('var(--font-family-roboto)');
    } else {
      localStorage.setItem(this.storageKeys.font, value);
      SettingsService.setFontFamily('var(--font-family-victor)');
    }
  }

  constructor() {
    this._animationsDisabled = localStorage.getItem(this.storageKeys.animationsDisabled) === 'True';
    this._language = localStorage.getItem(this.storageKeys.language) ?? 'en';
    this._font = localStorage.getItem(this.storageKeys.font) as Font ?? 'Roboto';
    SettingsService.setFontFamily(this._font);
  }

  private static setFontFamily(value: string): void {
    (document.querySelector(':root') as any)
      .style.setProperty('--font-family', value);
  }
}

type Font = 'Victor Mono' | 'Roboto'
