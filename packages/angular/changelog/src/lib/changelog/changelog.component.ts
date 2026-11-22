import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  PendingTasks,
  signal,
} from '@angular/core';
import { MethodTemplateDirective } from '@rxap/directives';
import { RXAP_ENVIRONMENT } from '@rxap/environment';
import { MarkdownModule } from 'ngx-markdown';
import { ChangelogControllerGetVersionRemoteMethod } from '../openapi/remote-methods/changelog-controller-get-version.remote-method';
import { ChangelogControllerListRemoteMethod } from '../openapi/remote-methods/changelog-controller-list.remote-method';

@Component({
    selector: 'rxap-changelog',
    imports: [
    MethodTemplateDirective,
    MarkdownModule,
    NgClass
],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './changelog.component.html',
    styleUrls: ['./changelog.component.scss']
})
export class ChangelogComponent {

  public readonly availableVersions = signal<string[]>([]);
  public readonly error = signal<string | null>(null);
  public readonly activeIndex = signal(-1);
  public readonly selectedVersion = computed(() => {
    const activeIndex = this.activeIndex();
    const availableVersions = this.availableVersions();
    if (activeIndex > -1) {
      return availableVersions[activeIndex] ?? 'latest';
    }
    return availableVersions[availableVersions.length - 1] ?? 'latest';
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

  private readonly getAvailableVersionsMethod = inject(ChangelogControllerListRemoteMethod);

  constructor() {
    this.loadAvailableVersions();
  }

  private readonly pendingTasks = inject(PendingTasks);

  private async loadAvailableVersions() {
    // register the load as an Angular pending task so that whenStable() waits for it (zoneless)
    const removeTask = this.pendingTasks.add();
    try {
      const availableVersions = await this.getAvailableVersionsMethod.call();
      this.availableVersions.set(availableVersions);
      this.activeIndex.set(availableVersions.length - 1);
    } catch (e: any) {
      this.error.set(e.message);
    } finally {
      removeTask();
    }
  }

}
