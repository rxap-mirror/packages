import { TestBed } from '@angular/core/testing';
import { WindowResizerComponent } from './window-resizer.component';

describe(WindowResizerComponent.name, () => {
  beforeEach(() => {
    TestBed.overrideComponent(WindowResizerComponent, {
      add: {
        imports: [],
        providers: [],
      },
    });
  });

  it('renders', () => {
    cy.mount(WindowResizerComponent);
  });
});
