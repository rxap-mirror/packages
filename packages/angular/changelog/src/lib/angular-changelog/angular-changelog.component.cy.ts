import { TestBed } from '@angular/core/testing';
import { AngularChangelogComponent } from './angular-changelog.component';

describe(AngularChangelogComponent.name, () => {
  beforeEach(() => {
    TestBed.overrideComponent(AngularChangelogComponent, {
      add: {
        imports: [],
        providers: [],
      },
    });
  });

  it('renders', () => {
    cy.mount(AngularChangelogComponent);
  });
});
