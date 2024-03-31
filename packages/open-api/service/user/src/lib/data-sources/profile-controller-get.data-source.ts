import { Injectable } from '@angular/core';
import {
  OpenApiDataSource,
  RxapOpenApiDataSource,
} from '@rxap/open-api/data-source';
import { ProfileControllerGetResponse } from '../responses/profile-controller-get.response';

@Injectable({
  providedIn: 'root',
})
@RxapOpenApiDataSource('ProfileController_get')
export class ProfileControllerGetDataSource extends OpenApiDataSource<ProfileControllerGetResponse<TResponse>, void> {
}
