import { TestBed } from '@angular/core/testing';
import { FormWindowService } from './form-window.service';
import {
  OpenFormWindowMethod,
  RXAP_FORM_WINDOW_SYSTEM_OPEN_FORM_COMPONENT,
  RXAP_FORM_WINDOW_SYSTEM_OPEN_FORM_DEFAULT_OPTIONS,
  RXAP_FORM_WINDOW_SYSTEM_OPEN_FORM_DEFINITION_CONSTRUCTOR,
} from './open-form-window.method';

class Def {}
class Cmp {}

describe('OpenFormWindowMethod', () => {
  const formWindowService = { open: jest.fn().mockReturnValue('ref') };

  function setup(extra: any[] = []) {
    formWindowService.open.mockClear();
    TestBed.configureTestingModule({
      providers: [
        OpenFormWindowMethod,
        { provide: FormWindowService, useValue: formWindowService },
        { provide: RXAP_FORM_WINDOW_SYSTEM_OPEN_FORM_DEFINITION_CONSTRUCTOR, useValue: Def },
        ...extra,
      ],
    });
    return TestBed.inject(OpenFormWindowMethod);
  }

  it('opens the form window with the definition constructor', () => {
    const method = setup();
    expect(method.call({ a: 1 })).toBe('ref');
    const [ctor, options] = formWindowService.open.mock.calls[0];
    expect(ctor).toBe(Def);
    expect(options.initial).toEqual({ a: 1 });
    expect(options.component).toBeUndefined();
    expect(options.injector).toBeDefined();
  });

  it('merges default options, component and call options', () => {
    const method = setup([
      { provide: RXAP_FORM_WINDOW_SYSTEM_OPEN_FORM_COMPONENT, useValue: Cmp },
      { provide: RXAP_FORM_WINDOW_SYSTEM_OPEN_FORM_DEFAULT_OPTIONS, useValue: { initial: { d: 1 }, title: 'D' } },
    ]);
    method.call(undefined, { title: 'O' });
    const options = formWindowService.open.mock.calls[0][1];
    expect(options.component).toBe(Cmp);
    expect(options.initial).toEqual({ d: 1 });
    expect(options.title).toBe('O');
  });

  it('uses the component of the default options', () => {
    const method = setup([
      { provide: RXAP_FORM_WINDOW_SYSTEM_OPEN_FORM_DEFAULT_OPTIONS, useValue: { component: Cmp } },
    ]);
    method.call();
    expect(formWindowService.open.mock.calls[0][1].component).toBe(Cmp);
  });
});
