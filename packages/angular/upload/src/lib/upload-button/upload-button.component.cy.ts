import { TestBed } from '@angular/core/testing';
import { ProvideIconAssetPath } from '@rxap/icon';
import { UploadButtonComponent } from './upload-button.component';

describe(UploadButtonComponent.name, () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ ProvideIconAssetPath() ],
    });
  });

  it('renders', () => {
    cy.mount(UploadButtonComponent);
  });

  it('renders with value', () => {
    cy.mount(UploadButtonComponent, {
      componentProperties: {
        placeholder: 'custom-placeholder',
      },
    });
    cy.contains('custom-placeholder');
  });

  it('should emit uploaded on file upload', () => {
    cy.mount(UploadButtonComponent, {
      autoSpyOutputs: true,
    });
    cy.get('input[type=file]').attachFile('example.json');
    cy.get('@uploadedSpy').should('have.been.called');
    cy.contains('example.json');
  });

});
