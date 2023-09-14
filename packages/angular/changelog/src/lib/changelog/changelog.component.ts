import {
  NgClass,
  NgForOf,
  NgIf,
} from '@angular/common';
import {
  Component,
  computed,
  inject,
  signal,
  Signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MethodTemplateDirective } from '@rxap/directives';
import { RXAP_ENVIRONMENT } from '@rxap/environment';
import { MarkdownModule } from 'ngx-markdown';
import { from } from 'rxjs';
import { ChangelogControllerGetVersionRemoteMethod } from '../remote-methods/changelog-controller-get-version.remote-method';
import { ChangelogControllerListRemoteMethod } from '../remote-methods/changelog-controller-list.remote-method';

@Component({
  selector: 'rxap-changelog',
  standalone: true,
  imports: [
    MethodTemplateDirective,
    MarkdownModule,
    NgForOf,
    NgIf,
    NgClass,
  ],
  templateUrl: './changelog.component.html',
  styleUrls: [ './changelog.component.scss' ],
})
export class ChangelogComponent {

  // eslint-disable-next-line no-async-promise-executor
  public readonly availableVersions: Signal<string[]> = toSignal(from(new Promise<string[]>(async resolve => resolve(
    await inject(ChangelogControllerListRemoteMethod).call()))), { initialValue: [] });
  public readonly activeIndex = signal(-1);
  public readonly selectedVersion = computed(() => {
    const activeIndex = this.activeIndex();
    const availableVersions = this.availableVersions();
    if (activeIndex > -1) {
      return availableVersions[activeIndex] ?? 'latest';
    }
    return availableVersions[availableVersions.length - 1] ?? 'latest';
  });
  public readonly selectedIndex = computed(() => {
    const activeIndex = this.activeIndex();
    return activeIndex === -1 ? this.availableVersions().length - 1 : activeIndex;
  });

  public readonly displayedButtons = computed(() => {
    let activeIndex = this.activeIndex();
    if (activeIndex === -1) {
      activeIndex = this.availableVersions().length - 1;
    }
    let start = Math.max(0, activeIndex - 2);
    let end = Math.min(this.availableVersions().length, activeIndex + 3);
    if (end - start < 5) {
      if (start === 0) {
        end += 5 - (end - start);
      } else {
        start -= 5 - (end - start);
      }
    }
    end = Math.min(this.availableVersions().length, end);
    start = Math.max(0, start);
    return Array.from(
      { length: end - start },
      (_, i) => ({
        index: start + i,
        version: this.availableVersions()[start + i],
      }),
    );
  });

  public readonly application = inject(RXAP_ENVIRONMENT).app;

  public readonly getChangelogMethod = inject(ChangelogControllerGetVersionRemoteMethod);

  public readonly getChangelogMethodParameters = computed(() => ({
    parameters: {
      version: this.selectedVersion(),
      application: this.application,
    },
  }));

}
