import {
  Inject,
  Injectable,
  INJECTOR,
  Injector,
} from '@angular/core';
import {
  BaseRemoteMethod,
  BaseRemoteMethodMetadata,
} from './base.remote-method';
import {
  REMOTE_METHOD_META_DATA,
  RXAP_PROXY_REMOTE_METHOD_TARGET,
} from './tokens';

@Injectable()
export abstract class ProxyRemoteMethod<ReturnType = any, SourceParameter = any, TargetParameter = SourceParameter>
  extends BaseRemoteMethod<ReturnType, SourceParameter> {

  constructor(
    @Inject(RXAP_PROXY_REMOTE_METHOD_TARGET)
    private readonly remoteMethod: BaseRemoteMethod,
    @Inject(INJECTOR)
      injector: Injector | null = null,
    @Inject(REMOTE_METHOD_META_DATA)
      metadata: BaseRemoteMethodMetadata = remoteMethod.metadata,
  ) {
    super(injector, metadata);
  }

  public abstract transformParameters(parameters?: SourceParameter): TargetParameter | Promise<TargetParameter>;

  protected async _call(parameters?: SourceParameter): Promise<any> {
    return this.remoteMethod.call(await this.transformParameters(parameters));
  }

}
