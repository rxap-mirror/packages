import { TestBed } from '@angular/core/testing';
import { DataSourceErrorComponent } from './data-source-error.component';

describe(DataSourceErrorComponent.name, () => {
  beforeEach(() => {
    TestBed.overrideComponent(DataSourceErrorComponent, {
      add: {
        imports: [],
        providers: [],
      },
    });
  });

  it('renders', () => {
    cy.mount(DataSourceErrorComponent);
  });
});
