import { Injectable } from '@angular/core';
import {
  ConfigurationControllerGetVersionParameter,
  ConfigurationControllerGetVersionResponse,
} from '@rxap/open-api-service-configuration';
import {
  OpenApiDataSource,
  RxapOpenApiDataSource,
} from '@rxap/open-api/data-source';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiDataSource('ConfigurationController_getVersion')
export class ConfigurationControllerGetVersionDataSource
  extends OpenApiDataSource<ConfigurationControllerGetVersionResponse, ConfigurationControllerGetVersionParameter> {
}
