import {
  Inject,
  Injectable,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { OpenApiDataSource } from './open-api.data-source';
import { OpenApiConfigService } from '@rxap/open-api';

@Injectable({ providedIn: 'root' })
export class OpenApiDataSourceLoader {

  constructor(
    @Inject(OpenApiConfigService) public readonly openApiConfig: OpenApiConfigService,
    @Inject(HttpClient) public readonly http: HttpClient,
  ) {}

  public load(definitionId: string): OpenApiDataSource | null {

    const operation = this.openApiConfig.getOperation(definitionId);

    if (operation) {
      return new OpenApiDataSource(
        this.http,
        this.openApiConfig,
        {
          id: definitionId,
          operation,
        },
      );
    }

    return null;
  }

}
