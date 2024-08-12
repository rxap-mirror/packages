import { Injectable } from '@angular/core';
import {
  MethodDataSource,
  RxapDataSource
} from '@rxap/data-source';
import {
  GetOauth2ProxyUserProfileMethod,
  Oauth2ProxyUserProfile,
} from './get-oauth2-proxy-user-profile.method';

@Injectable({ providedIn: 'root' })
@RxapDataSource('oauth2-proxy-user-profile')
export class Oauth2ProxyUserProfileDataSource extends MethodDataSource<Oauth2ProxyUserProfile> {

  constructor(method: GetOauth2ProxyUserProfileMethod) {super(method);}

}
