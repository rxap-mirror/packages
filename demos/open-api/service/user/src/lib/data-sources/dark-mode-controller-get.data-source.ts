import { Injectable } from '@angular/core';
import {
  OpenApiDataSource,
  RxapOpenApiDataSource,
} from '@rxap/open-api/data-source';
import { DarkModeControllerGetResponse } from '../responses/dark-mode-controller-get.response';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiDataSource('DarkModeController_get')
export class DarkModeControllerGetDataSource extends OpenApiDataSource<DarkModeControllerGetResponse, void> {
}
