import { TestBed } from '@angular/core/testing';
import { ConfigService } from '@rxap/config';
import {
  FIREBASE_APP,
  FIREBASE_AUTH,
  FIREBASE_FIRESTORE,
  FIREBASE_FUNCTIONS,
  FIREBASE_STORAGE,
} from './tokens';
import {
  FIREBASE_APP_PROVIDERS,
  FIREBASE_AUTH_PROVIDERS,
  FIREBASE_FIRESTORE_PROVIDERS,
  FIREBASE_FUNCTIONS_PROVIDERS,
  FIREBASE_STORAGE_PROVIDERS,
} from './firebase.provider';

/**
 * Smoke test with the real firebase SDK (no mocks): the providers must work without zone.js,
 * the former @angular/fire compat layer required a global Zone.
 */
describe('firebase providers with the real sdk (zoneless)', () => {
  const values: Record<string, unknown> = {
    'firebase.options': { apiKey: 'fake-api-key', projectId: 'sdk-smoke-test', authDomain: 'sdk-smoke-test.firebaseapp.com', storageBucket: 'sdk-smoke-test.appspot.com' },
    'firebase.name': 'sdk-smoke-test',
    'firebase.functions.region': 'europe-west1',
    'firebase.storage.maxUploadRetryTime': 1234,
    'firebase.emulator.auth': [ 'localhost', 9099 ],
    'firebase.emulator.firestore': [ 'localhost', 8080 ],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: ConfigService, useValue: { get: (key: string, def?: unknown) => (key in values ? values[key] : def) } },
        FIREBASE_APP_PROVIDERS,
        FIREBASE_AUTH_PROVIDERS,
        FIREBASE_FIRESTORE_PROVIDERS,
        FIREBASE_FUNCTIONS_PROVIDERS,
        FIREBASE_STORAGE_PROVIDERS,
      ],
    });
  });

  it('runs without a global Zone', () => {
    expect((globalThis as any).Zone).toBeUndefined();
  });

  it('creates the named app', () => {
    const app = TestBed.inject(FIREBASE_APP);
    expect(app.name).toBe('sdk-smoke-test');
    expect(app.options.projectId).toBe('sdk-smoke-test');
  });

  it('creates the services of the app', () => {
    const app = TestBed.inject(FIREBASE_APP);
    expect(TestBed.inject(FIREBASE_AUTH).app).toBe(app);
    expect((TestBed.inject(FIREBASE_AUTH).config as any).emulator).toBeDefined();
    expect(TestBed.inject(FIREBASE_FIRESTORE).app).toBe(app);
    expect(TestBed.inject(FIREBASE_FUNCTIONS).region).toBe('europe-west1');
    const storage = TestBed.inject(FIREBASE_STORAGE);
    expect(storage.app).toBe(app);
    expect(storage.maxUploadRetryTime).toBe(1234);
  });
});
