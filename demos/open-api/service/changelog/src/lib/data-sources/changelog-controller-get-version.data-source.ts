import { Injectable } from '@angular/core';
import {
  OpenApiDataSource,
  RxapOpenApiDataSource,
} from '@rxap/open-api/data-source';
import { ChangelogControllerGetVersionParameter } from '../parameters/changelog-controller-get-version.parameter';
import { ChangelogControllerGetVersionResponse } from '../responses/changelog-controller-get-version.response';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiDataSource('ChangelogController_getVersion')
export class ChangelogControllerGetVersionDataSource
  extends OpenApiDataSource<ChangelogControllerGetVersionResponse, ChangelogControllerGetVersionParameter> {
}
