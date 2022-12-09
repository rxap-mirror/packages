import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ThemeService {

  public get darkMode() {
    return this.darkMode$.value;
  }

  public baseFontSize = Number(localStorage.getItem('rxap-base-font-size') || 62.5);

  public readonly darkMode$: BehaviorSubject<boolean>;

  constructor() {
    // this.darkMode$ must be first bc the this.darkMode getter is used in this.toggleDarkTheme method
    this.darkMode$ = new BehaviorSubject<boolean>(localStorage.getItem('rxap-light-theme') === null);
    this.setBaseFontSize(this.baseFontSize);
    this.toggleDarkTheme(this.darkMode);
  }

  public toggleDarkTheme(checked: boolean = !this.darkMode): void {
    if (checked) {
      document.body.classList.add('dark-theme');
      localStorage.removeItem('rxap-light-theme');
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('rxap-light-theme', 'true');
    }
    if (checked !== this.darkMode$.value) {
      this.darkMode$.next(checked);
    }
  }

  public setBaseFontSize(value: number) {
    localStorage.setItem('rxap-base-font-size', value.toFixed(3));
    document.documentElement.style.fontSize = `${value}%`;
    this.baseFontSize                       = value;

    switch (value) {

      case 40:
        document.body.classList.remove('size-xxs', 'size-xs', 'size-s', 'size-m', 'size-l', 'size-xl', 'size-xxl', 'size-xxxl');
        document.body.classList.add('size-xxs');
        break;

      case 45:
        document.body.classList.remove('size-xxs', 'size-xs', 'size-s', 'size-m', 'size-l', 'size-xl', 'size-xxl', 'size-xxxl');
        document.body.classList.add('size-xs');
        break;

      case 55:
        document.body.classList.remove('size-xxs', 'size-xs', 'size-s', 'size-m', 'size-l', 'size-xl', 'size-xxl', 'size-xxxl');
        document.body.classList.add('size-s');
        break;

      case 62.5:
        document.body.classList.remove('size-xxs', 'size-xs', 'size-s', 'size-m', 'size-l', 'size-xl', 'size-xxl', 'size-xxxl');
        document.body.classList.add('size-m');
        break;

      case 70:
        document.body.classList.remove('size-xxs', 'size-xs', 'size-s', 'size-m', 'size-l', 'size-xl', 'size-xxl', 'size-xxxl');
        document.body.classList.add('size-l');
        break;

      case 80:
        document.body.classList.remove('size-xxs', 'size-xs', 'size-s', 'size-m', 'size-l', 'size-xl', 'size-xxl', 'size-xxxl');
        document.body.classList.add('size-xl');
        break;

      case 90:
        document.body.classList.remove('size-xxs', 'size-xs', 'size-s', 'size-m', 'size-l', 'size-xl', 'size-xxl', 'size-xxxl');
        document.body.classList.add('size-xxl');
        break;

      case 100:
        document.body.classList.remove('size-xxs', 'size-xs', 'size-s', 'size-m', 'size-l', 'size-xl', 'size-xxl', 'size-xxxl');
        document.body.classList.add('size-xxxl');
        break;

    }

  }

}
