import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { StatusCheckService } from '../status-check.service';
import { StatusCheckComponent } from './status-check.component';

describe(StatusCheckComponent.name, () => {
  beforeEach(() => {
    TestBed.overrideComponent(StatusCheckComponent, {
      add: {
        imports: [],
        providers: [],
      },
    });
    cy.viewport(1200, 800);
  });

  it('renders', () => {
    cy.mount(StatusCheckComponent, {
      imports: [
        RouterTestingModule,
      ],
      providers: [
        {
          provide: StatusCheckService,
          useValue: {
            counter: 0,
            getStatus: function (serviceNames: string[]) {
              switch (this.counter++) {
                case 0:
                  return of({
                    status: 'error',
                    info: {},
                    error: serviceNames.reduce((acc, serviceName) => ({
                      ...acc,
                      [serviceName]: { status: 'down' },
                    }), {}),
                  });
                case 1:
                  return of({
                    status: 'error',
                    info: serviceNames.slice(0, serviceNames.length - 5).reduce((acc, serviceName) => ({
                      ...acc,
                      [serviceName]: { status: 'up' },
                    }), {}),
                    error: serviceNames.slice(serviceNames.length - 5).reduce((acc, serviceName) => ({
                      ...acc,
                      [serviceName]: { status: 'down' },
                    }), {}),
                  });
                case 2:
                  return of({
                    status: 'error',
                    info: serviceNames.slice(0, serviceNames.length - 2).reduce((acc, serviceName) => ({
                      ...acc,
                      [serviceName]: { status: 'up' },
                    }), {}),
                    error: serviceNames.slice(serviceNames.length - 2).reduce((acc, serviceName) => ({
                      ...acc,
                      [serviceName]: { status: 'down' },
                    }), {}),
                  });
                default:
                  return of({
                    status: 'ok',
                    info: serviceNames.reduce((acc, serviceName) => ({
                      ...acc,
                      [serviceName]: { status: 'up' },
                    }), {}),
                  });
              }
            },
          },
        },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: of({
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
                    return [ 'api', 'database', 'storage', 'auth', 'cdn', 'service', 'nats', 'agent', 'remote' ];
                }
                return [];
              },
            }),
          },
        },
      ],
    });
  });
});
