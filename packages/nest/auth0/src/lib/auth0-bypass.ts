import { SetMetadata } from '@nestjs/common';

export const AUTH0_BYPASS_KEY = 'auth0-bypass';
export const Auth0Bypass = () => SetMetadata(AUTH0_BYPASS_KEY, true);
