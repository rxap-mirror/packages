import { HttpClient } from '@angular/common/http';
import {
  inject,
  Injectable
} from '@angular/core';
import { ConfigService } from '@rxap/config';
import { Method } from '@rxap/pattern';
import { firstValueFrom } from 'rxjs';

export interface Oauth2ProxyUserProfile {
  /**
   * User Id of the user
   */
  user: string;
  /**
   * Email address of the user
   */
  email: string;
}

@Injectable({ providedIn: 'root' })
export class GetOauth2ProxyUserProfileMethod implements Method<Oauth2ProxyUserProfile> {

  private readonly http = inject(HttpClient);

  private readonly config = inject(ConfigService);

  async call(): Promise<Oauth2ProxyUserProfile> {
    return firstValueFrom(this.http.get<Oauth2ProxyUserProfile>(this.config.get('oauth2.profileUrl', '/oauth2/userinfo')));
  }

}
