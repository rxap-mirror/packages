import {
  BaseRemoteMethod,
  BaseRemoteMethodMetadata,
  RemoteMethodLoader,
} from '@rxap/remote-method';
import {
  AbstractType,
  InjectionToken,
  Provider,
  Type,
} from '@angular/core';

export type MockRemoteMethod = (parameters?: any, metadata?: any) => any;

export class RemoteMethodTestingLoader extends RemoteMethodLoader {

  private mockedRemoteMethods = new Map<string, MockRemoteMethod>();

  public mock(remoteMethodId: string, resultOrFunction: any | MockRemoteMethod): void {
    let resultFunction: MockRemoteMethod;
    if (typeof resultOrFunction !== 'function') {
      resultFunction = () => resultOrFunction;
    } else {
      resultFunction = resultOrFunction;
    }
    this.mockedRemoteMethods.set(remoteMethodId, resultFunction);
  }

  public clearMocks(): void {
    this.mockedRemoteMethods.clear();
  }

  public deleteMock(remoteMethodId: string): boolean {
    return this.mockedRemoteMethods.delete(remoteMethodId);
  }

  public hasMock(remoteMethodId: string): boolean {
    return this.mockedRemoteMethods.has(remoteMethodId);
  }

  public getMock(remoteMethodId: string): MockRemoteMethod {
    if (!this.hasMock(remoteMethodId)) {
      throw new Error(`A remote method mock with the id '${remoteMethodId}' is not registered`);
    }
    return this.mockedRemoteMethods.get(remoteMethodId)!;
  }

  public override async call$<ReturnType = any, Parameters = any, Metadata extends BaseRemoteMethodMetadata = BaseRemoteMethodMetadata>(
    remoteMethodOrIdOrToken: string | BaseRemoteMethod<ReturnType, Parameters, Metadata> | Type<BaseRemoteMethod<ReturnType, Parameters, Metadata>> | InjectionToken<BaseRemoteMethod<ReturnType, Parameters, Metadata>> | AbstractType<BaseRemoteMethod<ReturnType, Parameters, Metadata>>,
    parameters?: Parameters,
    metadata?: Metadata,
  ): Promise<ReturnType> {

    if (typeof remoteMethodOrIdOrToken === 'string') {

      if (this.hasMock(remoteMethodOrIdOrToken)) {
        const resultFunction = this.getMock(remoteMethodOrIdOrToken)!;
        return await resultFunction(parameters, metadata);
      }
      return super.call$(remoteMethodOrIdOrToken, parameters, metadata);

    }

    return super.call$(remoteMethodOrIdOrToken, parameters, metadata);
  }

}

export const REMOTE_METHOD_TESTING_LOADER_PROVIDER: Provider = {
  provide: RemoteMethodLoader,
  useClass: RemoteMethodTestingLoader,
};
