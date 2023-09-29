import { Injectable } from '@angular/core';
import {
  ExpiredUnit,
  StorageGet,
  StorageHas,
  StorageKey,
  StorageRemove,
  StorageSet,
} from './storage-utility';

@Injectable()
export abstract class StorageService {
  protected constructor(private storage: Storage | null) {}

  has(key: string): boolean {
    return StorageHas(this.storage, key);
  }

  get(key: string): any {
    return StorageGet(this.storage, key);
  }

  set(key: string, value: any, expiredAt = 0, expiredUnit: ExpiredUnit = 'd'): void {
    return StorageSet(this.storage, key, value, expiredAt, expiredUnit);
  }

  /**
   * Removes the specified key, e.g.:
   * - `remove('key')` Remove `key` key
   * - `remove(/BMap_\w+/)` Bulk delete all keys starting with BMap_
   * @param key key name or regular expression
   */
  remove(key: string | RegExp): void {
    if (typeof key === 'string') {
      StorageRemove(this.storage, key);
      return;
    }
    let index = 0;
    let next = StorageKey(this.storage, index);
    const ls: string[] = [];
    while (next) {
      if (key.test(next)) {
        ls.push(next);
      }
      next = StorageKey(this.storage, ++index);
    }
    ls.forEach((v) => StorageRemove(this.storage, v));
  }

  clear(): void {
    this.storage?.clear();
  }
}

