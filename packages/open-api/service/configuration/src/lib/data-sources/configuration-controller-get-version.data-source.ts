import { Injectable } from '@angular/core';
import {
  OpenApiDataSource,
  RxapOpenApiDataSource,
} from '@rxap/open-api/data-source';
import { ConfigurationControllerGetVersionParameter } from '../parameters/configuration-controller-get-version.parameter';
import { ConfigurationControllerGetVersionResponse } from '../responses/configuration-controller-get-version.response';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiDataSource('ConfigurationController_getVersion')
export class ConfigurationControllerGetVersionDataSource
  extends OpenApiDataSource<ConfigurationControllerGetVersionResponse, ConfigurationControllerGetVersionParameter> {
}
