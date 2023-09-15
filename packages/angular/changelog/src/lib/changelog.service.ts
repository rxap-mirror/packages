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

@Injectable({
  providedIn: 'root',
})
export class ChangelogService {

  private readonly version = inject(RXAP_ENVIRONMENT).name;

  private readonly applicationRef = inject(ApplicationRef);

  public showChangelogDialog() {
    if (localStorage.getItem(RXAP_CHANGELOG_LAST_VERSION) === this.version) {
      return;
    }
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
          localStorage.setItem(RXAP_CHANGELOG_LAST_VERSION, this.version);
        }
      }),
    ).subscribe();
  }

  public showChangelogDialogIfNewVersion() {

    const lastVersion = localStorage.getItem(RXAP_CHANGELOG_LAST_VERSION);

    if (this.version && lastVersion && this.version !== lastVersion) {
      localStorage.removeItem(RXAP_CHANGELOG_LAST_VERSION);
    }

    this.showChangelogDialog();

  }

}
