import {
  RxapOpenApiDataSource,
  OpenApiDataSource,
} from '@rxap/open-api/data-source';
import { Injectable } from '@angular/core';
import { DarkModeControllerGetResponse } from '../responses/dark-mode-controller-get.response';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiDataSource('DarkModeController_get')
export class DarkModeControllerGetDataSource extends OpenApiDataSource<DarkModeControllerGetResponse, void> {
}
