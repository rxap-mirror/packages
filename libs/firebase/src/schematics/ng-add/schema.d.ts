export interface NgAddSchema {
  project?: string;
  functions?: boolean;
  analytics?: boolean;
  performance?: boolean;
  storage?: boolean;
  appCheck?: boolean;
  firestore?: boolean;
  auth?: boolean;
  useEmulator?: boolean;
  hostingSite?: string;
}
