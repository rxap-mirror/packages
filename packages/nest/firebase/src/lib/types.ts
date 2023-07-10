import {
  app,
  auth,
  firestore,
} from 'firebase-admin';

export type FirebaseUser = auth.DecodedIdToken;
export type FirebaseApp = app.App;
export type Firestore = firestore.Firestore
