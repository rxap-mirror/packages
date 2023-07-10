import { TestBed } from '@angular/core/testing';
import { TreeComponent } from './tree.component';

describe(TreeComponent.name, () => {
  beforeEach(() => {
    TestBed.overrideComponent(TreeComponent, {
      add: {
        imports: [], providers: [],
      },
    });
  });

  it('renders', () => {
    cy.mount(TreeComponent, {
      componentProperties: {
        multiple: false, hideLeafIcon: false, id: '', dividerOffset: '256px',
      },
    });
  });
});
