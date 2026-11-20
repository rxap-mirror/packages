import { Injectable, InjectionToken, inject } from '@angular/core';
import { RXAP_FORM_CONTEXT } from '@rxap/forms';
import type {
  OpenApiRemoteMethod,
  OpenApiRemoteMethodParameter,
} from '@rxap/open-api/remote-method';
import { ProxyRemoteMethod } from '@rxap/remote-method';

export const SUBMIT_CONTEXT_FORM_ADAPTER_METHOD = new InjectionToken('submit-context-form-adapter-method');

@Injectable()
export class SubmitContextFormAdapter
  extends ProxyRemoteMethod<unknown, Record<string, unknown>, OpenApiRemoteMethodParameter<Record<string, unknown>>> {
  private readonly context = inject<Record<string, unknown>>(RXAP_FORM_CONTEXT);


  constructor() {
    const remoteMethod = inject<OpenApiRemoteMethod<unknown, OpenApiRemoteMethodParameter<Record<string, unknown>>, Record<string, unknown>>>(SUBMIT_CONTEXT_FORM_ADAPTER_METHOD);

    super(remoteMethod);
  }

  public transformParameters(value: Record<string, unknown>): OpenApiRemoteMethodParameter {
    return {
      parameters: this.context ?? {},
      requestBody: value,
    };
  }

}

export function SubmitContextFormAdapterFactory(
  remoteMethod: OpenApiRemoteMethod,
  context: Record<string, unknown>,
) {
  return new SubmitContextFormAdapter(
    remoteMethod,
    context,
  );
}
