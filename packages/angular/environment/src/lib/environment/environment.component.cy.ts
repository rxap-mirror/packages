import { TestBed } from '@angular/core/testing';
import { EnvironmentComponent } from './environment.component';
import { RXAP_ENVIRONMENT } from './tokens';
import { Environment } from '../environment';

describe(EnvironmentComponent.name, () => {
  beforeEach(() => {
    TestBed.overrideComponent(EnvironmentComponent, {
      add: {
        imports: [],
        providers: [],
      },
    });
  });

  it('renders', () => {
    const environment: Environment = {
      name: 'cypress-test',
      production: false,
      serviceWorker: false,
      release: '1.0.0',
      commit: '1234567890',
      timestamp: Date.now(),
      branch: 'master',
      tag: 'v1.0.0',
      tier: 'dev',
      slug: {
        name: 'cypress-test',
      },
    };
    cy.mount(EnvironmentComponent, {
      providers: [
        {
          provide: RXAP_ENVIRONMENT,
          useValue: environment,
        },
      ],
    });
    cy.contains('button', 'Show build info').click();
    cy.get('table tr').should('have.length', 8);
  });
});
