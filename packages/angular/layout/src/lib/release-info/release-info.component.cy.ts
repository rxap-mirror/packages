import { TestBed } from '@angular/core/testing';
import { ReleaseInfoComponent } from './release-info.component';

describe(ReleaseInfoComponent.name, () => {
  beforeEach(() => {
    TestBed.overrideComponent(ReleaseInfoComponent, {
      add: {
        imports: [],
        providers: [],
      },
    });
  });

  it('renders', () => {
    cy.mount(ReleaseInfoComponent);
  });
});
