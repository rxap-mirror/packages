import * as admin from 'firebase-admin';
import { FirebaseModule } from './firebase.module';
import {
  ALLOW_UNVERIFIED_EMAIL,
  DEACTIVATE_APP_CHECK_GUARD,
  DEACTIVATE_FIREBASE_AUTH_GUARD,
  FIREBASE_AUTH_HEADER,
  FIREBASE_TOKEN,
  FIRESTORE,
} from './tokens';

jest.mock('firebase-admin', () => ({ apps: [] as any[], initializeApp: jest.fn() }));

const mockAdmin = admin as any;

function value(module: any, token: string) {
  return module.providers.find((p: any) => p.provide === token)?.useValue;
}

describe('FirebaseModule.forRoot', () => {
  const firestore = { id: 'fs' };
  const app = { name: '[DEFAULT]', firestore: () => firestore };

  beforeEach(() => {
    mockAdmin.apps.length = 0;
    mockAdmin.initializeApp.mockReset().mockReturnValue(app);
  });

  it('initializes a new app with defaults', () => {
    const m = FirebaseModule.forRoot();
    expect(mockAdmin.initializeApp).toHaveBeenCalledWith({ projectId: undefined }, undefined);
    expect(value(m, FIREBASE_TOKEN)).toBe(app);
    expect(value(m, FIRESTORE)).toBe(firestore);
    expect(value(m, ALLOW_UNVERIFIED_EMAIL)).toBe(false);
    expect(value(m, FIREBASE_AUTH_HEADER)).toBe('idtoken');
    expect(value(m, DEACTIVATE_APP_CHECK_GUARD)).toBe(false);
    expect(value(m, DEACTIVATE_FIREBASE_AUTH_GUARD)).toBe(false);
    expect(m.exports).toContain(FIRESTORE);
  });

  it('passes options through', () => {
    const m = FirebaseModule.forRoot({
      initializeApp: { name: 'n', defaultProject: 'proj', options: { databaseURL: 'u' } },
      auth: { allowUnverifiedEmail: true, authHeaderName: 'x-token', deactivated: true },
      appCheck: { deactivated: true },
    });
    expect(mockAdmin.initializeApp).toHaveBeenCalledWith({ projectId: 'proj', databaseURL: 'u' }, 'n');
    expect(value(m, ALLOW_UNVERIFIED_EMAIL)).toBe(true);
    expect(value(m, FIREBASE_AUTH_HEADER)).toBe('x-token');
    expect(value(m, DEACTIVATE_APP_CHECK_GUARD)).toBe(true);
    expect(value(m, DEACTIVATE_FIREBASE_AUTH_GUARD)).toBe(true);
  });

  it('reuses the first existing app when no name is given', () => {
    const existing = { name: 'a', firestore: () => firestore };
    mockAdmin.apps.push(existing);
    expect(value(FirebaseModule.forRoot(), FIREBASE_TOKEN)).toBe(existing);
    expect(mockAdmin.initializeApp).not.toHaveBeenCalled();
  });

  it('reuses an existing app by name, else creates it', () => {
    const existing = { name: 'a', firestore: () => firestore };
    mockAdmin.apps.push(existing);
    expect(value(FirebaseModule.forRoot({ initializeApp: { name: 'a' } }), FIREBASE_TOKEN)).toBe(existing);
    expect(mockAdmin.initializeApp).not.toHaveBeenCalled();
    FirebaseModule.forRoot({ initializeApp: { name: 'b' } });
    expect(mockAdmin.initializeApp).toHaveBeenCalledTimes(1);
  });
});
