import { TestBed } from '@angular/core/testing';
import { ImageCellComponent } from './image-cell.component';

describe(ImageCellComponent.name, () => {
  beforeEach(() => {
    TestBed.overrideComponent(ImageCellComponent, {
      add: {
        imports: [], providers: [],
      },
    });
  });

  it('renders', () => {
    cy.mount(ImageCellComponent, {
      componentProperties: {
        preset: '', size: BackgroundSizeOptions.COVER, repeat: BackgroundRepeatOptions.NO_REPEAT,
        position: BackgroundPositionOptions.CENTER_CENTER, value: null,
      },
    });
  });
});
