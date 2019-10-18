import 'reflect-metadata';
import { mergeDeepRight } from 'ramda';

export function hasMetadata(
  metadataKey: string,
  target: any,
  propertyKey?: string | symbol
): boolean {
  return Reflect.hasMetadata(metadataKey, target, propertyKey);
}

export function setMetadata<V>(
  metadataKey: string,
  metadataValue: V,
  target: any,
  propertyKey?: string | symbol
): void {
  Reflect.defineMetadata(metadataKey, metadataValue, target, propertyKey);
}

export function clearMetadata<V>(
  metadataKey: string,
  target: any,
  propertyKey?: string | symbol
): void {
  Reflect.deleteMetadata(metadataKey, target, propertyKey);
}

export function getMetadata<V>(
  metadataKey: string,
  target: any,
  propertyKey?: string | symbol
): V | null {
  return (Reflect.getMetadata(metadataKey, target, propertyKey) as V) || null;
}

export function getMetadataKeys(
  target: any,
  propertyKey?: string | symbol
): string[] {
  return Reflect.getMetadataKeys(target, propertyKey);
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
  setMetadata(metadataKey, [...metadata, metadataValue], target, propertyKey);
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
  setMetadata(metadataKey, mergeDeepRight(metadata, metadataValue), target, propertyKey);
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
