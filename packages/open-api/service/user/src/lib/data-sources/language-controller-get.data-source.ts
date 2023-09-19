import {
  RxapOpenApiDataSource,
  OpenApiDataSource,
} from '@rxap/open-api/data-source';
import { Injectable } from '@angular/core';
import { LanguageControllerGetResponse } from '../responses/language-controller-get.response';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiDataSource('LanguageController_get')
export class LanguageControllerGetDataSource extends OpenApiDataSource<LanguageControllerGetResponse, void> {
}
