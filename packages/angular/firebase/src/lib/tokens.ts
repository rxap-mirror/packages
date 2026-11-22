import { InjectionToken } from '@angular/core';
import type { Analytics } from 'firebase/analytics';
import type {
  FirebaseApp,
  FirebaseOptions,
} from 'firebase/app';
import type { AppCheck } from 'firebase/app-check';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import type { Functions } from 'firebase/functions';
import type { Messaging } from 'firebase/messaging';
import type { FirebasePerformance } from 'firebase/performance';
import type { FirebaseStorage } from 'firebase/storage';

export const RXAP_REQUEST_CLOUD_MESSAGING_TOKEN = new InjectionToken('rxap/firebase/request-cloud-messaging-token');
export const APP_CHECK_ENABLED = new InjectionToken('rxap/firebase/app-check-enabled');
export const APP_CHECK_SITE_KEY = new InjectionToken('rxap/firebase/app-check-site-key');
export const APP_CHECK_IS_TOKEN_AUTO_REFRESH_ENABLED = new InjectionToken(
  'rxap/firebase/app-check-is-token-auto-refresh-enabled');
export const FIREBASE_APP_CHECK_HTTP_INTERCEPTOR_URL_PATTERN = new InjectionToken<RegExp>(
  'firebase-app-check-http-interceptor-url-pattern');

/**
 * The options the firebase app is initialized with.
 */
export const FIREBASE_OPTIONS = new InjectionToken<FirebaseOptions>('rxap/firebase/options');
/**
 * The name of the firebase app. If not provided (or null) the default app is used.
 */
export const FIREBASE_APP_NAME = new InjectionToken<string | null>('rxap/firebase/app-name');
export const FIREBASE_APP = new InjectionToken<FirebaseApp>('rxap/firebase/app');
export const FIREBASE_AUTH = new InjectionToken<Auth>('rxap/firebase/auth');
export const FIREBASE_FIRESTORE = new InjectionToken<Firestore>('rxap/firebase/firestore');
export const FIREBASE_FUNCTIONS = new InjectionToken<Functions>('rxap/firebase/functions');
export const FIREBASE_STORAGE = new InjectionToken<FirebaseStorage>('rxap/firebase/storage');
export const FIREBASE_PERFORMANCE = new InjectionToken<FirebasePerformance>('rxap/firebase/performance');
/**
 * null if firebase messaging is not supported in the current environment
 */
export const FIREBASE_MESSAGING = new InjectionToken<Messaging | null>('rxap/firebase/messaging');
export const FIREBASE_MESSAGING_VAPID_KEY = new InjectionToken<string | null>('rxap/firebase/messaging-vapid-key');
/**
 * null if firebase analytics is not available in the current environment
 */
export const FIREBASE_ANALYTICS = new InjectionToken<Analytics | null>('rxap/firebase/analytics');
/**
 * null if app check is disabled or not configured
 */
export const FIREBASE_APP_CHECK = new InjectionToken<AppCheck | null>('rxap/firebase/app-check');
