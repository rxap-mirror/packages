import { Provider, inject, provideAppInitializer } from '@angular/core';
import { ChangelogService } from './changelog.service';

export function ProvideChangelog(): Provider {
  return provideAppInitializer(() => {
        const initializerFn = ((changelogService: ChangelogService) => () => changelogService.showChangelogDialogIfNewVersion())(inject(ChangelogService));
        return initializerFn();
      });
}
