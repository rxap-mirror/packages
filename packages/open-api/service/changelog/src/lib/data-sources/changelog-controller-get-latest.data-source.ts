import { Injectable } from '@angular/core';
import {
  OpenApiDataSource,
  RxapOpenApiDataSource,
} from '@rxap/open-api/data-source';
import { ChangelogControllerGetLatestParameter } from '../parameters/changelog-controller-get-latest.parameter';
import { ChangelogControllerGetLatestResponse } from '../responses/changelog-controller-get-latest.response';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiDataSource('ChangelogController_getLatest')
export class ChangelogControllerGetLatestDataSource
  extends OpenApiDataSource<ChangelogControllerGetLatestResponse, ChangelogControllerGetLatestParameter> {
}
