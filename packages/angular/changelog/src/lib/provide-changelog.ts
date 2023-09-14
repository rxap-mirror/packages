import {
  APP_INITIALIZER,
  Provider,
} from '@angular/core';
import { ChangelogService } from './changelog.service';

export function ProvideChangelog(): Provider {
  return {
    provide: APP_INITIALIZER,
    multi: true,
    deps: [ ChangelogService ],
    useFactory: (changelogService: ChangelogService) => () => changelogService.showChangelogDialogIfNewVersion(),
  };
}
