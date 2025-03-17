import {
  Inject,
  Injectable
} from '@nestjs/common';
import {
  ManagementClient,
  ManagementClientOptionsWithClientCredentials,
  ManagementClientOptionsWithToken
} from 'auth0';
import { AUTH0_MANAGEMENT_OPTIONS } from './tokens';

@Injectable()
export class Auth0ManagementService extends ManagementClient {

  constructor(
    @Inject(AUTH0_MANAGEMENT_OPTIONS)
    options: ManagementClientOptionsWithToken | ManagementClientOptionsWithClientCredentials
  ) {
    // @ts-expect-error - constructor signature is not compatible with the base class
    super(options);
  }

}
