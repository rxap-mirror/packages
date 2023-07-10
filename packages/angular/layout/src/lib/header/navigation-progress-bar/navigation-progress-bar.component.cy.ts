import { TestBed } from '@angular/core/testing';
import { NavigationProgressBarComponent } from './navigation-progress-bar.component';

describe(NavigationProgressBarComponent.name, () => {
  beforeEach(() => {
    TestBed.overrideComponent(NavigationProgressBarComponent, {
      add: {
        imports: [], providers: [],
      },
    });
  });

  it('renders', () => {
    cy.mount(NavigationProgressBarComponent);
  });
});
