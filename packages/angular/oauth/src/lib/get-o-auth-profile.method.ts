import {
  Inject,
  Injectable,
  InjectionToken,
  Optional,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Method } from '@rxap/pattern';
import { firstValueFrom } from 'rxjs';

export const PROFILE_AUTH_ENDPOINT = new InjectionToken(
  'PROFILE_AUTH_ENDPOINT',
);

export interface GetOAuthProfileMethodParameters {
  accessToken: string;
  profileEndpoint?: string | null;
  withCredentials?: boolean;
}

@Injectable({ providedIn: 'root' })
export class GetOAuthProfileMethod<T = any>
  implements Method<T, GetOAuthProfileMethodParameters> {
  constructor(
    @Inject(HttpClient)
    private readonly http: HttpClient,
    @Optional()
    @Inject(PROFILE_AUTH_ENDPOINT)
    public profileEndpoint: string | null = null,
  ) {
  }

  public call(parameters: GetOAuthProfileMethodParameters): Promise<T> {
    const profileEndpoint = parameters.profileEndpoint ?? this.profileEndpoint;

    if (!profileEndpoint) {
      throw new Error('The profile endpoint is not defined');
    }

    return firstValueFrom(this.http
                              .get<T>(profileEndpoint, {
                                headers: {
                                  Authorization: `Bearer ${ parameters.accessToken }`,
                                },
                                withCredentials: parameters.withCredentials ?? true,
                              }));
  }
}
