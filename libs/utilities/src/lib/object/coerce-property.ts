export function CoerceProperty(obj: Record<any, any> | object, propertyPath: string, value: any) {

  const pathList = propertyPath.split('.');

  if (pathList.length === 0) {
    throw new Error('FATAL: path list is empty');
  }

  const firstPath = pathList.shift()!;

  if (!obj.hasOwnProperty(firstPath)) {
    if (pathList.length === 0) {
      (obj as any)[firstPath] = value;
    } else {
      (obj as any)[firstPath] = {};
    }
  }

  if (pathList.length) {
    // CoerceProperty((obj as any)[ firstPath ], pathList.join('.'), value);
  }

}
