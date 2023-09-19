import { Injectable } from '@angular/core';
import {
  OpenApiDataSource,
  RxapOpenApiDataSource,
} from '@rxap/open-api/data-source';
import { LanguageControllerGetResponse } from '../responses/language-controller-get.response';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiDataSource('LanguageController_get')
export class LanguageControllerGetDataSource extends OpenApiDataSource<LanguageControllerGetResponse, void> {
}
