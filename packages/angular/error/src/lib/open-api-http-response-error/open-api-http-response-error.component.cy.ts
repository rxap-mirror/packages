import { TestBed } from '@angular/core/testing';
import { OpenApiHttpResponseErrorComponent } from './open-api-http-response-error.component';

describe(OpenApiHttpResponseErrorComponent.name, () => {
  beforeEach(() => {
    TestBed.overrideComponent(OpenApiHttpResponseErrorComponent, {
      add: {
        imports: [],
        providers: [],
      },
    });
  });

  it('renders', () => {
    cy.mount(OpenApiHttpResponseErrorComponent);
  });
});
