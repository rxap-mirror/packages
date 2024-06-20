import {
  ApplicationRef,
  createComponent,
  inject,
  Injectable,
} from '@angular/core';
import { RXAP_ENVIRONMENT } from '@rxap/environment';
import { take } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ChangelogDialogComponent } from './changelog-dialog/changelog-dialog.component';

export const RXAP_CHANGELOG_LAST_VERSION = 'RXAP_CHANGELOG_LAST_VERSION';
export const RXAP_CHANGELOG_DISABLED = 'RXAP_CHANGELOG_DISABLED';

@Injectable({
  providedIn: 'root',
})
export class ChangelogService {

  private readonly version = inject(RXAP_ENVIRONMENT).name;

  private readonly applicationRef = inject(ApplicationRef);

  public showChangelogDialog() {
    const body = document.getElementsByTagName('body')[0];
    const div = document.createElement('div');
    body.appendChild(div);
    const componentRef = createComponent(ChangelogDialogComponent, {
      hostElement: div,
      environmentInjector: this.applicationRef.injector,
    });
    this.applicationRef.attachView(componentRef.hostView);
    componentRef.instance.closeDialog.pipe(
      take(1),
      tap(remember => {
        componentRef.destroy();
        body.removeChild(div);
        div.remove();
        if (remember && this.version) {
          this.lastVersion = this.version;
        }
      }),
    ).subscribe();
  }

  public get isDisabled(): boolean {
    return localStorage.getItem(RXAP_CHANGELOG_DISABLED) === 'true';
  }

  public get lastVersion(): string | null {
    return localStorage.getItem(RXAP_CHANGELOG_LAST_VERSION);
  }

  public set lastVersion(version: string | null) {
    if (version) {
      localStorage.setItem(RXAP_CHANGELOG_LAST_VERSION, version);
    } else {
      localStorage.removeItem(RXAP_CHANGELOG_LAST_VERSION);
    }
  }

  public showChangelogDialogIfNewVersion() {

    if (this.isDisabled) {
      return;
    }

    const lastVersion = this.lastVersion;

    if (this.version && lastVersion && this.version !== lastVersion) {
      this.lastVersion = null;
    }

    if (this.lastVersion === this.version) {
      return;
    }

    this.showChangelogDialog();

  }

}
