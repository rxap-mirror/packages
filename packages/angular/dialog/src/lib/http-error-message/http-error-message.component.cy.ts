import { TestBed } from '@angular/core/testing';
import { HttpErrorMessageComponent } from './http-error-message.component';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpErrorResponse } from '@angular/common/http';

describe(HttpErrorMessageComponent.name, () => {
  beforeEach(() => {
    TestBed.overrideComponent(HttpErrorMessageComponent, {
      add: {
        imports: [],
        providers: [],
      },
    });
  });

  it('renders', () => {
    cy.mount(HttpErrorMessageComponent, {
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            ...new HttpErrorResponse({
              status: 404,
              statusText: 'Not Found',
              url: 'https://api.github.com/users/rxap',
            }),
            method: 'GET',
            body: { message: 'Not Found' },
          },
        },
      ],
    });
  });
});
