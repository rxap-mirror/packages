import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ThemeService {

  public readonly darkMode$: BehaviorSubject<boolean>;

  constructor() {
    // this.darkMode$ must be first bc the this.darkMode getter is used in this.toggleDarkTheme method
    this.darkMode$ = new BehaviorSubject<boolean>(localStorage.getItem('rxap-light-theme') === null);
    this.toggleDarkTheme(this.darkMode);
  }

  public get darkMode() {
    return this.darkMode$.value;
  }

  public toggleDarkTheme(checked = !this.darkMode): void {
    if (checked) {
      document.body.classList.add('dark-theme');
      document.body.classList.add('dark');
      localStorage.removeItem('rxap-light-theme');
    } else {
      document.body.classList.remove('dark-theme');
      document.body.classList.remove('dark');
      localStorage.setItem('rxap-light-theme', 'true');
    }
    if (checked !== this.darkMode$.value) {
      this.darkMode$.next(checked);
    }
  }


}
