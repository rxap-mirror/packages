/**
 * InjectionToken to provided the firebase options object used in the
 * firebase app initialization.
 */
export const FIREBASE_OPTIONS_TOKEN = 'FIREBASE_OPTIONS';

/**
 * InjectionToken to access the firebase app instance in the current
 * context
 */
export const FIREBASE_TOKEN = 'FIREBASE';

/**
 * InjectionToken to provided the name of the firebase app that should be
 * created
 */
export const FIREBASE_APP_NAME = 'FIREBASE_APP_NAME';

/**
 * Whether to allow users to pass the id token validation with
 * unverified emails
 */
export const ALLOW_UNVERIFIED_EMAIL = 'ALLOW_UNVERIFIED_EMAIL';

/**
 * The name of the header used to transfer the firebase auth token.
 * Defaults to: idtoken
 */
export const FIREBASE_AUTH_HEADER = 'FIREBASE_AUTH_HEADER';

/**
 * InjectionToken to access the firestore instance in the current context
 */
export const FIRESTORE = 'FIRESTORE';

/**
 * true - the AppCheckGuard is skipped and always return true
 */
export const DEACTIVATE_APP_CHECK_GUARD = 'DEACTIVATE_APP_CHECK_GUARD';

/**
 * true - the FirebaseAuthGuard is skipped and always return true
 */
export const DEACTIVATE_FIREBASE_AUTH_GUARD = 'DEACTIVATE_FIREBASE_AUTH_GUARD';
