import {InjectionToken} from '@angular/core';

export const RXAP_REQUEST_CLOUD_MESSAGING_TOKEN = new InjectionToken('rxap/firebase/request-cloud-messaging-token');
export const APP_CHECK_ENABLED = new InjectionToken('rxap/firebase/app-check-enabled');
export const APP_CHECK_SITE_KEY = new InjectionToken('rxap/firebase/app-check-site-key');
export const APP_CHECK_IS_TOKEN_AUTO_REFRESH_ENABLED = new InjectionToken('rxap/firebase/app-check-is-token-auto-refresh-enabled');
export const FIREBASE_APP_CHECK_HTTP_INTERCEPTOR_URL_PATTERN = new InjectionToken<RegExp>('firebase-app-check-http-interceptor-url-pattern');
