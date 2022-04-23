import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  storageKeys = {
    animationsDisabled: 'animations_disabled'
  };

  private _animationsDisabled: boolean;
  get animationsDisabled() { return this._animationsDisabled };
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

  constructor() {
    this._animationsDisabled = localStorage.getItem(this.storageKeys.animationsDisabled) === 'True';
  }
}
