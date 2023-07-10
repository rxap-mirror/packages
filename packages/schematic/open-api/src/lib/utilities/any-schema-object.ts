export interface AnySchemaObject {
  type: 'any'
}

export function IsAnySchemaObject(obj: any): obj is AnySchemaObject {
  return obj && obj['type'] && obj.type === 'any';
}
