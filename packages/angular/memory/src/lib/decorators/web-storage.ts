import {
  ExpiredUnit,
  StorageGet,
  StorageHas,
  StorageRemove,
  StorageSet,
} from '../storage-utility';

/**
 * @internal
 * @param storage
 * @param key
 * @param expiredAt
 * @param expiredUnit
 */
export function WebStorage(
  storage: Storage | null,
  key?: string,
  expiredAt = 0,
  expiredUnit: ExpiredUnit = 'd',
) {
  return (target: any, propertyName: string): void => {
    const storageKey = key ?? propertyName;
    let propertyValue: unknown | undefined = undefined;
    Object.defineProperty(target, propertyName, {
      get: () => {
        // check if the value is set
        if (propertyValue === undefined) {
          // if not check if the value is set in the storage
          if (StorageHas(storage, storageKey)) {
            return propertyValue = StorageGet(storage, storageKey);
          }
        }
        return propertyValue;
      },
      set: (value: unknown) => {
        // check if the value is set
        if (propertyValue === undefined) {
          // if not check if the value is set in the storage
          if (StorageHas(storage, storageKey)) {
            // if yes, get the value from the storage
            propertyValue = StorageGet(storage, storageKey);
            return;
          }
        }
        propertyValue = value;
        // check if the value is set
        if (propertyValue === undefined) {
          // check if the value is set in the storage
          if (StorageHas(storage, storageKey)) {
            // remove any value from the storage
            StorageRemove(storage, storageKey);
          }
        } else {
          // set the value in the storage
          StorageSet(storage, storageKey, value, expiredAt, expiredUnit);
        }
      },
      enumerable: true,
      configurable: true,
    });
  };
}
