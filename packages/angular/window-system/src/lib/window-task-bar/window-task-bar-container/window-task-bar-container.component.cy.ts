import { TestBed } from '@angular/core/testing';
import { WindowTaskBarContainerComponent } from './window-task-bar-container.component';

describe(WindowTaskBarContainerComponent.name, () => {
  beforeEach(() => {
    TestBed.overrideComponent(WindowTaskBarContainerComponent, {
      add: {
        imports: [],
        providers: [],
      },
    });
  });

  it('renders', () => {
    cy.mount(WindowTaskBarContainerComponent);
  });
});
