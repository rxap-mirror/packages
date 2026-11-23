import type { App } from 'firebase-admin/app';
import type { DecodedIdToken } from 'firebase-admin/auth';
import type { Firestore as AdminFirestore } from 'firebase-admin/firestore';

export type FirebaseUser = DecodedIdToken;
export type FirebaseApp = App;
export type Firestore = AdminFirestore;
