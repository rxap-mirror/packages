import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormSystemMetadataKeys } from '@rxap/form-system';
import {
  RXAP_FORM_CONTEXT,
  RXAP_FORM_INITIAL_STATE,
  RXAP_FORM_LOAD_METHOD,
  RXAP_FORM_SUBMIT_METHOD,
  RXAP_FORM_SUBMIT_SUCCESSFUL_METHOD,
  RXAP_FORM_DEFINITION_BUILDER,
  RxapForm,
  RxapFormBuilder,
} from '@rxap/forms';
import { setMetadata } from '@rxap/reflect-metadata';
import { WindowService } from '@rxap/window-system';
import { FormWindowService } from './form-window.service';

class FormComponent {}

@RxapForm('with-component')
@Injectable()
class FormDefinitionWithComponent {}
setMetadata(FormSystemMetadataKeys.FORM_COMPONENT, FormComponent, FormDefinitionWithComponent);

class FormDefinitionWithoutComponent {}

describe('FormWindowService', () => {
  const windowService = { open: vi.fn().mockReturnValue('window-ref') };
  let service: FormWindowService;

  beforeEach(() => {
    windowService.open.mockClear();
    TestBed.configureTestingModule({
      providers: [{ provide: WindowService, useValue: windowService }],
    });
    service = TestBed.inject(FormWindowService);
  });

  const lastConfig = () => windowService.open.mock.calls[0][0];

  it('opens a window with the extracted form component', () => {
    expect(service.open(FormDefinitionWithComponent as any)).toBe('window-ref');
    expect(lastConfig().component).toBe(FormComponent);
    expect(lastConfig().injector).toBeDefined();
  });

  it('throws when no component can be extracted', () => {
    expect(() => service.open(FormDefinitionWithoutComponent as any)).toThrow(
      'Could not extract form component constructor',
    );
  });

  it('prefers the component option and passes window options', () => {
    class Other {}
    service.open(FormDefinitionWithoutComponent as any, { component: Other, title: 'T', width: undefined } as any);
    expect(lastConfig().component).toBe(Other);
    expect(lastConfig().title).toBe('T');
    expect('width' in lastConfig()).toBe(false);
  });

  it('creates providers from the options', () => {
    service.open(FormDefinitionWithComponent as any, {
      initial: { a: 1 },
      submitMethod: 'submit' as any,
      submitSuccessfulMethod: 'success' as any,
      loadMethod: 'load' as any,
      context: 'ctx',
      injectorName: 'Named',
    } as any);
    const injector = lastConfig().injector;
    expect(injector.get(RXAP_FORM_INITIAL_STATE)).toEqual({ a: 1 });
    expect(injector.get(RXAP_FORM_SUBMIT_METHOD)).toBe('submit');
    expect(injector.get(RXAP_FORM_SUBMIT_SUCCESSFUL_METHOD)).toBe('success');
    expect(injector.get(RXAP_FORM_LOAD_METHOD)).toBe('load');
    expect(injector.get(RXAP_FORM_CONTEXT)).toBe('ctx');
  });

  it('resets submit and load methods', () => {
    service.open(FormDefinitionWithComponent as any, { resetSubmit: true, resetLoad: true } as any);
    const injector = lastConfig().injector;
    expect(injector.get(RXAP_FORM_SUBMIT_METHOD)).toBeNull();
    expect(injector.get(RXAP_FORM_LOAD_METHOD)).toBeNull();
  });

  it('provides the form definition builder when the definition is injectable', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [{ provide: WindowService, useValue: windowService }, FormDefinitionWithComponent],
    });
    TestBed.inject(FormWindowService).open(FormDefinitionWithComponent as any, { providers: [] });
    expect(lastConfig().injector.get(RXAP_FORM_DEFINITION_BUILDER)).toBeInstanceOf(RxapFormBuilder);
  });
});
