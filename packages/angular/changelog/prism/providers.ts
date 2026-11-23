import { Provider } from '@angular/core';
import { provideMarkdown } from 'ngx-markdown';
import { ChangelogControllerGetVersionRemoteMethod } from '../src/lib/openapi/remote-methods/changelog-controller-get-version.remote-method';
import { ChangelogControllerListRemoteMethod } from '../src/lib/openapi/remote-methods/changelog-controller-list.remote-method';

const AVAILABLE_VERSIONS = [ '1.2.0', '1.3.0', '1.4.0', '1.4.1', '1.4.2' ];

/**
 * Providers of the ng-prism styleguide host for the showcases of this library.
 * The styleguide has no changelog backend, so the remote methods return demo data.
 * Collected by the @rxap/plugin-ng-prism:init-library generator.
 */
export const PRISM_PROVIDERS: Provider[] = [
  // the changelog entries are rendered with the markdown component
  provideMarkdown(),
  {
    provide: ChangelogControllerListRemoteMethod,
    useValue: {
      call: () => Promise.resolve(AVAILABLE_VERSIONS),
    },
  },
  {
    provide: ChangelogControllerGetVersionRemoteMethod,
    useValue: {
      call: (options?: { parameters?: { version?: string } }) => {
        const version = options?.parameters?.version ?? 'latest';
        return Promise.resolve({
          general: [
            `## ${ version }\n\n### Features\n\n- Added the dashboard widgets\n- Added the dark mode\n\n### Bug Fixes\n\n- Fixed the navigation highlighting`,
          ],
          application: [
            `### Demo App\n\n- Improved the loading time of the user list`,
          ],
        });
      },
    },
  },
];
