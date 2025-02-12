import { Injectable } from '@angular/core';
import {
  OpenApiDataSource,
  RxapOpenApiDataSource,
} from '@rxap/open-api/data-source';
import { ChangelogControllerListResponse } from '../responses/changelog-controller-list.response';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiDataSource('ChangelogController_list')
export class ChangelogControllerListDataSource extends OpenApiDataSource<ChangelogControllerListResponse, void> {
}
