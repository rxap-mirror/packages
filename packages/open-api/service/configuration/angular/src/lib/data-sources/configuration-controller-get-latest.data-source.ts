import { Injectable } from '@angular/core';
import {
  ConfigurationControllerGetLatestParameter,
  ConfigurationControllerGetLatestResponse,
} from '@rxap/open-api-service-configuration';
import {
  OpenApiDataSource,
  RxapOpenApiDataSource,
} from '@rxap/open-api/data-source';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiDataSource('ConfigurationController_getLatest')
export class ConfigurationControllerGetLatestDataSource
  extends OpenApiDataSource<ConfigurationControllerGetLatestResponse, ConfigurationControllerGetLatestParameter> {
}
