import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormDirective } from '@rxap/forms';
import { RXAP_WINDOW_REF } from '@rxap/window-system';
import { FormWindowFooterDirective } from './form-window-footer.directive';

@Component({
  standalone: true,
  imports: [FormWindowFooterDirective],
  template: `<ng-template rxapFormWindowFooter let-ref>footer</ng-template>`,
})
class HostComponent {}

describe('FormWindowFooterDirective', () => {
  it('sets the footer portal on the window ref', () => {
    const windowRef = { setFooterPortal: jest.fn() };
    const formDirective = { formDefinition: { id: 'def' } };
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [
        { provide: RXAP_WINDOW_REF, useValue: windowRef },
        { provide: FormDirective, useValue: formDirective },
      ],
    });
    TestBed.createComponent(HostComponent).detectChanges();
    expect(windowRef.setFooterPortal).toHaveBeenCalledTimes(1);
    const portal = windowRef.setFooterPortal.mock.calls[0][0];
    expect(portal.context).toEqual({
      $implicit: windowRef,
      formDefinition: formDirective.formDefinition,
      formDirective,
    });
  });
});
