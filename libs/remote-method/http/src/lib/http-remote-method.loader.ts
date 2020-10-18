import {
  RemoteMethodLoader,
  BaseRemoteMethodMetadata,
  RxapRemoteMethodError,
  BaseRemoteMethod
} from '@rxap/remote-method';
import { HttpRemoteMethod } from './http.remote-method';
import {
  Injectable,
  Inject,
  Injector,
  InjectFlags
} from '@angular/core';
import { IdOrInstanceOrToken } from '@rxap/definition';

@Injectable({ providedIn: 'root' })
export class HttpRemoteMethodLoader {

  // Instead of extanding the RemoteMethodLoader class the RemoteMethodLoader instance
  // will be injected, else there could be multiple instance of RemoteMethodLoader's. Then
  // the RefreshService will not trigger a refresh for HttpRemoteMethod's
  constructor(@Inject(RemoteMethodLoader) private readonly remoteMethodLoader: RemoteMethodLoader) {}

  public request$<ReturnType = any, Parameters = any, Metadata extends BaseRemoteMethodMetadata = BaseRemoteMethodMetadata>(
    remoteMethodIdOrInstanceOrToken: IdOrInstanceOrToken<BaseRemoteMethod<ReturnType, Parameters, Metadata>>,
    parameters: Parameters,
    metadata?: Partial<BaseRemoteMethodMetadata>,
    injector?: Injector,
    notFoundValue?: BaseRemoteMethod<ReturnType, Parameters, Metadata>,
    flags?: InjectFlags
  ) {

    const remoteMethod = this.remoteMethodLoader.load(
      remoteMethodIdOrInstanceOrToken,
      metadata,
      injector,
      notFoundValue,
      flags
    );

    if (!(remoteMethod instanceof HttpRemoteMethod)) {
      throw new RxapRemoteMethodError(`The remote method is not a HttpRemoteMethod`, '', 'HttpRemoteMethodLoader');
    }

    return remoteMethod.call(parameters);
  }

}
