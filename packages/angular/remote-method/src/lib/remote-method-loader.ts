import {Injectable, InjectFlags, Injector} from '@angular/core';
import {BaseRemoteMethod, BaseRemoteMethodMetadata} from './base.remote-method';
import {DefinitionLoader, IdOrInstanceOrToken} from '@rxap/definition';

@Injectable({providedIn: 'root'})
export class RemoteMethodLoader extends DefinitionLoader {

  public async call$<ReturnType = any, Parameters = any, Metadata extends BaseRemoteMethodMetadata = BaseRemoteMethodMetadata>(
    remoteMethodIdOrInstanceOrToken: IdOrInstanceOrToken<BaseRemoteMethod<ReturnType, Parameters, Metadata>>,
    parameters: Parameters,
    metadata?: Partial<BaseRemoteMethodMetadata>,
    injector?: Injector,
    notFoundValue?: BaseRemoteMethod<ReturnType, Parameters, Metadata>,
    flags?: InjectFlags,
  ): Promise<ReturnType> {
    return this
      .load(
        remoteMethodIdOrInstanceOrToken,
        metadata,
        injector,
        notFoundValue,
        flags,
      )
      .call(parameters);
  }

}
