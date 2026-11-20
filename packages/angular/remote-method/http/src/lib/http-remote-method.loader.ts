import {
  BaseRemoteMethod,
  BaseRemoteMethodMetadata,
  RemoteMethodLoader,
  RxapRemoteMethodError,
} from '@rxap/remote-method';
import { HttpRemoteMethod } from './http.remote-method';
import { Injectable, InjectOptions, Injector, inject } from '@angular/core';
import { IdOrInstanceOrToken } from '@rxap/definition';

@Injectable({ providedIn: 'root' })
export class HttpRemoteMethodLoader {
  private readonly remoteMethodLoader = inject<RemoteMethodLoader>(RemoteMethodLoader);


  public request$<ReturnType = any, Parameters = any, Metadata extends BaseRemoteMethodMetadata = BaseRemoteMethodMetadata>(
    remoteMethodIdOrInstanceOrToken: IdOrInstanceOrToken<BaseRemoteMethod<ReturnType, Parameters, Metadata>>,
    parameters: Parameters,
    metadata?: Partial<BaseRemoteMethodMetadata>,
    injector?: Injector,
    notFoundValue?: BaseRemoteMethod<ReturnType, Parameters, Metadata>,
    flags?: InjectOptions,
  ) {

    const remoteMethod = this.remoteMethodLoader.load(
      remoteMethodIdOrInstanceOrToken,
      metadata,
      injector,
      notFoundValue,
      flags,
    );

    if (!(remoteMethod instanceof HttpRemoteMethod)) {
      throw new RxapRemoteMethodError(`The remote method is not a HttpRemoteMethod`, '', 'HttpRemoteMethodLoader');
    }

    return remoteMethod.call(parameters);
  }

}
