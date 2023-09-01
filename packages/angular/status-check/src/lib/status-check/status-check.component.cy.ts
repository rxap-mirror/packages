import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject } from 'rxjs';
import { StatusCheckService } from '../status-check.service';
import {
  STATUS_CHECK_INTERVAL,
  StatusCheckComponent,
} from './status-check.component';

describe(StatusCheckComponent.name, () => {

  const serviceNames = [ 'api', 'database', 'storage', 'auth', 'cdn', 'service', 'nats', 'agent', 'remote' ];

  let status$: BehaviorSubject<any>;
  let queryParamMap$: BehaviorSubject<any>;

  @Component({
    standalone: true,
    template: '<h1>Empty</h1>',
  })
  class EmptyComponent {}

  beforeEach(() => {
    status$ = new BehaviorSubject(mockLoadingStatus(serviceNames));
    queryParamMap$ = new BehaviorSubject<any>({
      get: (name: string) => {
        switch (name) {
          case 'url':
            return '/table/testing';
        }
        return null;
      },
      getAll: (name: string) => {
        switch (name) {
          case 'service':
            return serviceNames;
        }
        return [];
      },
    });
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([
          {
            path: 'table/testing',
            component: EmptyComponent,
          },
        ]),
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: queryParamMap$,
          },
        },
        {
          provide: StatusCheckService,
          useValue: {
            getStatus: function () {
              return status$;
            },
          },
        },
      ],
    });
    TestBed.overrideComponent(StatusCheckComponent, {
      add: {
        imports: [],
        providers: [],
      },
    });
    cy.viewport(1200, 800);
  });

  function mockLoadingStatus(serviceNames: string[]) {
    return {
      status: 'loading',
      info: serviceNames.reduce((acc, serviceName) => ({
        ...acc,
        [serviceName]: { status: 'loading' },
      }), {}),
      error: {},
    };
  }

  function mockStatus(serviceNames: string[], downCount = 0) {
    downCount = Math.min(serviceNames.length, downCount);
    const info = serviceNames.slice(0, serviceNames.length - downCount).reduce((acc, serviceName) => ({
      ...acc,
      [serviceName]: { status: 'up' },
    }), {});
    const error = serviceNames.slice(serviceNames.length - downCount).reduce((acc, serviceName) => ({
      ...acc,
      [serviceName]: { status: 'down' },
    }), {});
    return {
      status: downCount === 0 ? 'ok' : 'error',
      info,
      error,
    };
  }

  it(`should refresh the status every ${ STATUS_CHECK_INTERVAL } seconds`, () => {

    cy.mount(StatusCheckComponent);

    cy.get('tr').should('have.length', serviceNames.length);
    cy.get('tr').should('have.class', 'bg-yellow-100');
    cy.get('tr td').each(($el) => {
      expect($el).to.have.text('loading');
    }).then(() => {

      status$.next(mockStatus(serviceNames, 3));

      cy.get('tr td', { timeout: STATUS_CHECK_INTERVAL })
        .filter(':contains("up")')
        .should('have.length', serviceNames.length - 3);
      cy.get('tr td').filter(':contains("down")').should('have.length', 3).then(() => {

        status$.next(mockStatus(serviceNames, serviceNames.length));
        cy.get('tr td', { timeout: STATUS_CHECK_INTERVAL }).filter(':contains("up")').should('have.length', 0);
        cy.get('tr td').filter(':contains("down")').should('have.length', serviceNames.length).then(() => {

          status$.next(mockStatus(serviceNames));
          cy.get('tr td', { timeout: STATUS_CHECK_INTERVAL })
            .filter(':contains("up")')
            .should('have.length', serviceNames.length);
          cy.get('tr td').filter(':contains("down")').should('have.length', 0);

        });

      });

    });

  });

  it('should show warning if not all services are up and the user click on the navigation link', () => {
    status$.next(mockStatus(serviceNames, 1));
    cy.mount(StatusCheckComponent);

    cy.get('a').click();
    cy.get('h1').should('contain.text', 'Warning');
    cy.get('p').should('contain.text', 'Caution:');

  });

  it('should handle the case that no services are selected', () => {
    status$.next({ status: 'empty' });
    cy.mount(StatusCheckComponent);
    cy.get('p').should('contain.text', 'No services are currently selected.');
    cy.get('a').click();
    cy.get('h1').should('not.exist');
  });

  it('should handle the case that a fatal error occurred', () => {
    status$.next({ status: 'fatal' });
    cy.mount(StatusCheckComponent);
    cy.get('p')
      .should('contain.text', 'Something went unexpectedly wrong. Try reloading the page or contact an administrator.');
    cy.get('a').click();
    cy.get('h1').should('not.exist');
  });

  it('should handle the case that a unavailable error occurred', () => {
    status$.next({ status: 'unavailable' });
    cy.mount(StatusCheckComponent);
    cy.get('p').should('contain.text', 'Failed to retrieve status for selected services.');
    cy.get('a').click();
    cy.get('h1').should('not.exist');
  });

  it('renders', () => {
    status$ = new BehaviorSubject(mockStatus(serviceNames));
    cy.mount(StatusCheckComponent);
  });
});
