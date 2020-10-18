import {
  Injectable,
  Injector,
  Inject
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { OpenApiRemoteMethod } from './open-api.remote-method';
import { OpenApiConfigService } from '@rxap/open-api';

@Injectable({ providedIn: 'root' })
export class OpenApiRemoteMethodLoader {

  constructor(
    @Inject(OpenApiConfigService) public readonly openApiConfig: OpenApiConfigService,
    @Inject(HttpClient) public readonly http: HttpClient,
    public readonly injector: Injector
  ) {}

  public load(definitionId: string): OpenApiRemoteMethod | null {
    const operation = this.openApiConfig.getOperation(definitionId);

    if (operation) {

      return new OpenApiRemoteMethod(
        this.http,
        this.injector,
        this.openApiConfig,
        {
          id: definitionId,
          operation
        }
      );

    }

    return null;

  }

}
