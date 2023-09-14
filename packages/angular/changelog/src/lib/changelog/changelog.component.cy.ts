import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RXAP_ENVIRONMENT } from '@rxap/environment';
import { ToMethod } from '@rxap/pattern';
import { MarkdownModule } from 'ngx-markdown';
import { ChangelogControllerGetVersionRemoteMethod } from '../remote-methods/changelog-controller-get-version.remote-method';
import { ChangelogControllerListRemoteMethod } from '../remote-methods/changelog-controller-list.remote-method';
import { ChangelogComponent } from './changelog.component';

describe(ChangelogComponent.name, () => {

  let applicationChangeLog = `## For 16.0.0-dev.7

### Bug Fixes

- add browser-tailwind as imp dep if project has tailwind configuration 6ea13c5
- add tailwind bundle build target and configurations bec6b96
- generate readme with peer dependencies to install e7039bb`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        MarkdownModule.forRoot(),
      ],
      providers: [
        {
          provide: RXAP_ENVIRONMENT,
          useValue: { app: 'cypress' },
        },
        {
          provide: ChangelogControllerListRemoteMethod,
          useValue: ToMethod(() => [ '1.0.0', '1.0.1', '2.3.2', '2.3.3', '2.3.4', '4.4.5', '5.4.6', '6.5.5', '8.5.5' ]),
        },
        {
          provide: ChangelogControllerGetVersionRemoteMethod,
          useValue: ToMethod(({
                                parameters: {
                                  version,
                                  application,
                                },
                              }) => ({
            general: [ `# Changelog ${ version } - ${ application }` ],
            application: [ applicationChangeLog ],
          })),
        },
      ],
    });
    cy.viewport(1280, 720);
  });

  it('renders', () => {
    cy.mount(ChangelogComponent);
  });

  it.only('should show scrollbar', () => {
    applicationChangeLog += applicationChangeLog;
    applicationChangeLog += applicationChangeLog;
    applicationChangeLog += applicationChangeLog;
    applicationChangeLog += applicationChangeLog;
    applicationChangeLog += applicationChangeLog;
    applicationChangeLog += applicationChangeLog;
    applicationChangeLog += applicationChangeLog;
    applicationChangeLog += applicationChangeLog;
    cy.mount(ChangelogComponent);
  });

});
