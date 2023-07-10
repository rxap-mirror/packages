import {DynamicModule, Global, Logger, Module} from '@nestjs/common';
import * as admin from 'firebase-admin';
import {
  ALLOW_UNVERIFIED_EMAIL,
  DEACTIVATE_APP_CHECK_GUARD,
  DEACTIVATE_FIREBASE_AUTH_GUARD,
  FIREBASE_AUTH_HEADER,
  FIREBASE_TOKEN,
  FIRESTORE,
} from './tokens';
import {FirebaseAuthGuard} from './firebase-auth.guard';
import {FirebaseAppCheckGuard} from './firebase-app-check.guard';

export type FirebaseAppOptions = admin.AppOptions;

export interface FirebaseAuthOptions {
  allowUnverifiedEmail?: boolean;
  authHeaderName?: string;
  deactivated?: boolean;
}

export interface FirebaseAppCheckOptions {
  deactivated?: boolean;
}

export interface FirebaseOptions {
  options?: FirebaseAppOptions,
  name?: string,
  defaultProject?: string,
}

export interface ForRootOptions {
  initializeApp?: FirebaseOptions,
  auth?: FirebaseAuthOptions;
  appCheck?: FirebaseAppCheckOptions,
}

@Global()
@Module({})
export class FirebaseModule {

  public static forRoot(options?: ForRootOptions): DynamicModule {

    const app = this.createFirebaseApp(
      options?.initializeApp?.options,
      options?.initializeApp?.name,
      options?.initializeApp?.defaultProject,
    );

    return {
      module: FirebaseModule,
      providers: [
        {
          provide: FIREBASE_TOKEN,
          useValue: app,
        },
        {
          provide: FIRESTORE,
          useValue: app.firestore(),
        },
        {
          provide: ALLOW_UNVERIFIED_EMAIL,
          useValue: options?.auth?.allowUnverifiedEmail ?? false,
        },
        {
          provide: FIREBASE_AUTH_HEADER,
          useValue: options?.auth?.authHeaderName ?? 'idtoken',
        },
        {
          provide: DEACTIVATE_APP_CHECK_GUARD,
          useValue: !!options?.appCheck?.deactivated,
        },
        {
          provide: DEACTIVATE_FIREBASE_AUTH_GUARD,
          useValue: !!options?.auth?.deactivated,
        },
        FirebaseAuthGuard,
        FirebaseAppCheckGuard,
        Logger,
      ],
      exports: [
        FirebaseAuthGuard,
        FirebaseAppCheckGuard,
        FIRESTORE,
        FIREBASE_TOKEN,
        ALLOW_UNVERIFIED_EMAIL,
        FIREBASE_AUTH_HEADER,
        DEACTIVATE_APP_CHECK_GUARD,
        DEACTIVATE_FIREBASE_AUTH_GUARD,
      ],
    };
  }

  private static createFirebaseApp(options?: admin.AppOptions, name?: string, defaultProject?: string): admin.app.App {

    if (admin.apps.length) {
      if (name) {
        const existingApp = admin.apps.find(app => app && app.name === name);
        if (existingApp) {
          return existingApp;
        }
      } else if (admin.apps[0]) {
        return admin.apps[0] as admin.app.App;
      }
    }

    return admin.initializeApp({
      projectId: defaultProject,
      ...options,
    }, name);

  }

}
