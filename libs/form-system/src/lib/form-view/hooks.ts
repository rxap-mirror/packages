export interface OnSetControl {
  rxapOnSetControl(): void;
}

export function hasOnSetControlHook<T extends object>(component: T): component is OnSetControl & T {
  return (component as any)[ 'rxapOnSetControl' ] && typeof (component as any)[ 'rxapOnSetControl' ] === 'function';
}
