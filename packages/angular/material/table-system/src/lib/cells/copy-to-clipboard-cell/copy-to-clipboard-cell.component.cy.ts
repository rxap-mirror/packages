import { TestBed } from '@angular/core/testing';
import { CopyToClipboardCellComponent } from './copy-to-clipboard-cell.component';

describe(CopyToClipboardCellComponent.name, () => {
  beforeEach(() => {
    TestBed.overrideComponent(CopyToClipboardCellComponent, {
      add: {
        imports: [],
        providers: [],
      },
    });
  });

  it('renders', () => {
    cy.mount(CopyToClipboardCellComponent);
  });
});
