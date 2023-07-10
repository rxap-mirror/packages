export function IsHttpMethod(method: string): method is 'get' | 'put' | 'post' | 'delete' | 'patch' {
  return ['get', 'put', 'post', 'delete', 'patch'].includes(method);
}
