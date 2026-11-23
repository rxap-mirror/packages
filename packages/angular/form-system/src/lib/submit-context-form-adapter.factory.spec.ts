import { RXAP_FORM_CONTEXT } from '@rxap/forms';
import {
  SUBMIT_CONTEXT_FORM_ADAPTER_METHOD,
  SubmitContextFormAdapter,
  SubmitContextFormAdapterFactory,
} from './submit-context-form-adapter.factory';
import { TestBed } from '@angular/core/testing';

describe('SubmitContextFormAdapter', () => {

  function remoteMethod(result: unknown = 'response') {
    return {
      metadata: { id: 'submit-remote-method' },
      call: vi.fn().mockResolvedValue(result),
    } as any;
  }

  it('submits the form value as request body together with the form context as parameters', async () => {
    const target = remoteMethod();
    const adapter = TestBed.runInInjectionContext(() => SubmitContextFormAdapterFactory(target, { uuid: '1' }));
    expect(adapter).toBeInstanceOf(SubmitContextFormAdapter);
    await expect(adapter.call({ name: 'x' })).resolves.toBe('response');
    expect(target.call).toHaveBeenCalledWith({
      parameters: { uuid: '1' },
      requestBody: { name: 'x' },
    });
  });

  it('falls back to empty parameters without a form context', async () => {
    const target = remoteMethod();
    const adapter = TestBed.runInInjectionContext(() => SubmitContextFormAdapterFactory(target, null as any));
    await adapter.call({ name: 'x' });
    expect(target.call).toHaveBeenCalledWith({ parameters: {}, requestBody: { name: 'x' } });
  });

  it('can be provided through the injection tokens', () => {
    const target = remoteMethod();
    TestBed.configureTestingModule({
      providers: [
        { provide: SUBMIT_CONTEXT_FORM_ADAPTER_METHOD, useValue: target },
        { provide: RXAP_FORM_CONTEXT, useValue: { uuid: '2' } },
        SubmitContextFormAdapter,
      ],
    });
    const adapter = TestBed.inject(SubmitContextFormAdapter);
    expect(adapter.transformParameters({ a: 1 })).toEqual({ parameters: { uuid: '2' }, requestBody: { a: 1 } });
  });

});
