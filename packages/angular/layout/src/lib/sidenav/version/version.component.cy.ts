import { TestBed } from '@angular/core/testing';
import { VersionComponent } from './version.component';

describe(VersionComponent.name, () => {
  beforeEach(() => {
    TestBed.overrideComponent(VersionComponent, {
      add: {
        imports: [],
        providers: [],
      },
    });
  });

  it('renders', () => {
    cy.mount(VersionComponent);
  });
});
