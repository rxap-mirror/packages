import { MediaMatcher } from '@angular/cdk/layout';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ThemeService {

  public readonly darkMode$: BehaviorSubject<boolean>;

  constructor(mediaMatcher: MediaMatcher) {
    const darkModeCached = localStorage.getItem('rxap-dark-mode');
    const darkModeMediaQuery = mediaMatcher.matchMedia('(prefers-color-scheme: dark)');
    let darkMode: boolean | null = null;
    if (darkModeCached === 'true') {
      darkMode = true;
    }
    if (darkModeCached === 'false') {
      darkMode = false;
    }
    if (darkMode === null) {
      darkMode = darkModeMediaQuery.matches;
    }
    darkModeMediaQuery.addEventListener('change', (event) => {
      this.toggleDarkTheme(event.matches);
    });
    // this.darkMode$ must be first bc the this.darkMode getter is used in this.toggleDarkTheme method
    this.darkMode$ = new BehaviorSubject<boolean>(darkMode);
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
      localStorage.setItem('rxap-dark-mode', 'true');
    } else {
      document.body.classList.remove('dark-theme');
      document.body.classList.remove('dark');
      localStorage.setItem('rxap-light-theme', 'true');
      localStorage.setItem('rxap-dark-mode', 'false');
    }
    if (checked !== this.darkMode$.value) {
      this.darkMode$.next(checked);
    }
  }


}
