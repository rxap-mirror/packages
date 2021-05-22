import 'reflect-metadata';
import { deepMerge } from './deep-merge';
import { unique } from './array/unique';

export function hasMetadata(
  metadataKey: string,
  target: any,
  propertyKey?: string | symbol
): boolean {
  return Reflect.hasMetadata(metadataKey, target, propertyKey as any);
}

export function setMetadata<V>(
  metadataKey: string,
  metadataValue: V,
  target: any,
  propertyKey?: string | symbol
): void {
  Reflect.defineMetadata(metadataKey, metadataValue, target, propertyKey as any);
}

export function clearMetadata<V>(
  metadataKey: string,
  target: any,
  propertyKey?: string | symbol
): void {
  Reflect.deleteMetadata(metadataKey, target, propertyKey as any);
}

export function getMetadata<V>(
  metadataKey: string,
  target: any,
  propertyKey?: string | symbol
): V | null {
  return (Reflect.getMetadata(metadataKey, target, propertyKey as any) as V) || null;
}

export function getOwnMetadata<V>(
  metadataKey: string,
  target: any,
  propertyKey?: string | symbol
): V | null {
  return (Reflect.getOwnMetadata(metadataKey, target, propertyKey as any) as V) || null;
}

export function getMetadataKeys(
  target: any,
  propertyKey?: string | symbol
): string[] {
  return Reflect.getMetadataKeys(target, propertyKey as any);
}

export function addToMetadata<V>(
  metadataKey: string,
  metadataValue: V,
  target: any,
  propertyKey?: string | symbol
): void {
  if (!hasMetadata(metadataKey, target, propertyKey)) {
    setMetadata(metadataKey, [], target, propertyKey);
  }
  const metadata = getMetadata<V[]>(metadataKey, target, propertyKey) || [];
  setMetadata(metadataKey, [ ...metadata, metadataValue ].filter(unique()), target, propertyKey);
}

export function mergeWithMetadata<V extends object>(
  metadataKey: string,
  metadataValue: V,
  target: any,
  propertyKey?: string | symbol
): void {
  if (!hasMetadata(metadataKey, target, propertyKey)) {
    setMetadata(metadataKey, {}, target, propertyKey);
  }
  const metadata = getMetadata<V>(metadataKey, target, propertyKey) || {};
  setMetadata(metadataKey, deepMerge(metadata, metadataValue), target, propertyKey);
}

export function removeFromMetadata<V>(
  metadataKey: string,
  metadataValue: V,
  target: any,
  propertyKey?: string | symbol,
  isEqual: (a: V, b: V) => boolean = (a, b) => a === b
) {
  const metadata = getMetadata<V[]>(metadataKey, target, propertyKey) || [];

  setMetadata(
    metadataKey,
    metadata.filter(value => !isEqual(value, metadataValue)),
    target,
    propertyKey
  );
}

export function setMetadataMap<V = any, K = string>(key: K, value: V, metadataKey: string, target: any, propertyKey?: string) {

  let map: Map<K, V> | null = getOwnMetadata(metadataKey, target, propertyKey);

  if (!map) {
    const parentMap: Map<K, V> | null = getMetadata(metadataKey, target, propertyKey);
    if (parentMap) {
      map = new Map(parentMap.entries());
    } else {
      map = new Map<K, V>();
    }
  }

  map.set(key, value);

  setMetadata(metadataKey, map, target, propertyKey);

}

export function setMetadataMapSet<V = any, K = string>(key: K, value: V, metadataKey: string, target: any, propertyKey?: string) {

  let map: Map<K, Set<V>> | null = getOwnMetadata(metadataKey, target, propertyKey);

  if (!map) {
    const parentMap: Map<K, Set<V>> | null = getMetadata(metadataKey, target, propertyKey);
    if (parentMap) {
      map = new Map(parentMap.entries());
    } else {
      map = new Map<K, Set<V>>();
    }
  }

  if (!map.has(key)) {
    map.set(key, new Set());
  }

  const set = map.get(key)!;

  set.add(value);

  setMetadata(metadataKey, map, target, propertyKey);

}

export function setMetadataMapMap<V = any, K = string, K2 = string>(key: K, key2: K2, value: V, metadataKey: string, target: any, propertyKey?: string) {

  let map: Map<K, Map<K2, V>> | null = getOwnMetadata(metadataKey, target, propertyKey);

  if (!map) {
    const parentMap: Map<K, Map<K2, V>> | null = getMetadata(metadataKey, target, propertyKey);
    if (parentMap) {
      map = new Map(parentMap.entries());
    } else {
      map = new Map<K, Map<K2, V>>();
    }
  }

  if (!map.has(key)) {
    map.set(key, new Map<K2, V>());
  }

  const innerMap = map.get(key)!;

  innerMap.set(key2, value);

  setMetadata(metadataKey, map, target, propertyKey);

}
