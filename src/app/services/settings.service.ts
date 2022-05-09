import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  storageKeys = {
    animationsDisabled: 'animations_disabled',
    language: 'language'
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

  constructor() {
    this._animationsDisabled = localStorage.getItem(this.storageKeys.animationsDisabled) === 'True';
    this._language = localStorage.getItem(this.storageKeys.language) ?? 'en';
  }
}
