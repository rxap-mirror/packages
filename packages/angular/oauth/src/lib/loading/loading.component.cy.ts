import { TestBed } from '@angular/core/testing';
import { LoadingComponent } from './loading.component';

describe(LoadingComponent.name, () => {
  beforeEach(() => {
    TestBed.overrideComponent(LoadingComponent, {
      add: {
        imports: [],
        providers: [],
      },
    });
  });

  it('renders', () => {
    cy.mount(LoadingComponent);
  });
});
