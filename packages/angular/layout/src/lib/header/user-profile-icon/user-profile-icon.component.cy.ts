import { TestBed } from '@angular/core/testing';
import { UserProfileIconComponent } from './user-profile-icon.component';

describe(UserProfileIconComponent.name, () => {
  beforeEach(() => {
    TestBed.overrideComponent(UserProfileIconComponent, {
      add: {
        imports: [], providers: [],
      },
    });
  });

  it('renders', () => {
    cy.mount(UserProfileIconComponent);
  });
});
