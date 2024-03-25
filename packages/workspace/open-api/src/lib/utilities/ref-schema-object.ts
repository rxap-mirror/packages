export interface RefSchemaObject {
  $ref: string;
}

export function IsRefSchemaObject(obj: any): obj is RefSchemaObject {
  return obj && obj['$ref'];
}

export interface ArrayRefSchemaObject {
  type: 'array';
  items: RefSchemaObject;
}

export function IsArrayRefSchemaObject(obj: any): obj is ArrayRefSchemaObject {
  return obj && obj.type === 'array' && IsRefSchemaObject(obj.items);
}
