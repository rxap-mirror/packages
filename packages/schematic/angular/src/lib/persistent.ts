export enum PersistentStorageProvider {
  LocalStorage = 'localStorage',
  SessionStorage = 'sessionStorage'
}

export interface BasePersistent {
  storage?: PersistentStorageProvider;
}

export interface KeyPersistent extends BasePersistent {
  key: string;
}

export interface PropertyPersistent extends BasePersistent {
  property: {
    name: string;
    type?: string;
  };
}

export function IsKeyPersistent(persistent: Persistent): persistent is KeyPersistent {
  return (persistent as KeyPersistent).key !== undefined;
}

export function IsPropertyPersistent(persistent: Persistent): persistent is PropertyPersistent {
  return (persistent as PropertyPersistent).property !== undefined;
}

export type Persistent = KeyPersistent | PropertyPersistent;

export interface NormalizedBasePersistent {
  storage: PersistentStorageProvider;
}

export interface NormalizedKeyPersistent extends NormalizedBasePersistent {
  key: string;
}

export interface NormalizedPropertyPersistent extends NormalizedBasePersistent {
  property: {
    name: string;
    type: string;
  };
}

export type NormalizedPersistent = NormalizedKeyPersistent | NormalizedPropertyPersistent;

export function IsNormalizedKeyPersistent(persistent: NormalizedPersistent): persistent is NormalizedKeyPersistent {
  return (persistent as NormalizedKeyPersistent).key !== undefined;
}

export function IsNormalizedPropertyPersistent(persistent: NormalizedPersistent): persistent is NormalizedPropertyPersistent {
  return (persistent as NormalizedPropertyPersistent).property !== undefined;
}

export function NormalizePersistent(persistent: Persistent): NormalizedPersistent {
  const normalizedPersistent: NormalizedBasePersistent = {
    storage: PersistentStorageProvider.LocalStorage
  };
  if (IsKeyPersistent(persistent)) {
    return {
      ...normalizedPersistent,
      key: persistent.key
    };
  } else if (IsPropertyPersistent(persistent)) {
    return {
      ...normalizedPersistent,
      property: {
        name: persistent.property.name,
        type: persistent.property.type ?? 'string'
      }
    };
  }
  throw new Error('Invalid persistent object');
}
