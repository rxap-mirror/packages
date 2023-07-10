import { TestBed } from '@angular/core/testing';
import { WindowContentComponent } from './window-content.component';

describe(WindowContentComponent.name, () => {
  beforeEach(() => {
    TestBed.overrideComponent(WindowContentComponent, {
      add: {
        imports: [],
        providers: [],
      },
    });
  });

  it('renders', () => {
    cy.mount(WindowContentComponent);
  });
});
