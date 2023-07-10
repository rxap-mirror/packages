import { TestBed } from '@angular/core/testing';
import { UploadButtonComponent } from './upload-button.component';

describe(UploadButtonComponent.name, () => {
  beforeEach(() => {
    TestBed.overrideComponent(UploadButtonComponent, {
      add: {
        imports: [],
        providers: [],
      },
    });
  });

  it('renders', () => {
    cy.mount(UploadButtonComponent, {
      componentProperties: {
        accept: '**/**',
        disabled: false,
        required: false,
        placeholder: '',
      },
    });
  });
});
