import { TestBed } from '@angular/core/testing';
import { FooterComponent } from './footer.component';

describe(FooterComponent.name, () => {
  beforeEach(() => {
    TestBed.overrideComponent(FooterComponent, {
      add: {
        imports: [],
        providers: [],
      },
    });
  });

  it('renders', () => {
    cy.mount(FooterComponent);
  });
});
