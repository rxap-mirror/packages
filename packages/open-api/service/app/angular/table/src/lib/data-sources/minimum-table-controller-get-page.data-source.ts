import { Injectable } from '@angular/core';
import {
  OpenApiDataSource,
  RxapOpenApiDataSource,
} from '@rxap/open-api/data-source';
import { MinimumTableControllerGetPageParameter } from '../parameters/minimum-table-controller-get-page.parameter';
import { MinimumTableControllerGetPageResponse } from '../responses/minimum-table-controller-get-page.response';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiDataSource('MinimumTableController_getPage')
export class MinimumTableControllerGetPageDataSource
  extends OpenApiDataSource<MinimumTableControllerGetPageResponse, MinimumTableControllerGetPageParameter> {
}
