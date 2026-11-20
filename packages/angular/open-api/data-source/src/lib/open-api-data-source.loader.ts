import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { OpenApiDataSource } from './open-api.data-source';
import { OpenApiConfigService } from '@rxap/open-api';

@Injectable({ providedIn: 'root' })
export class OpenApiDataSourceLoader {
  readonly openApiConfig = inject<OpenApiConfigService>(OpenApiConfigService);
  readonly http = inject<HttpClient>(HttpClient);


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
