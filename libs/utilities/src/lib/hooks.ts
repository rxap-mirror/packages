export interface RxapOnInit {
  rxapOnInit(): void;
}

export function HasRxapOnInitMethod(obj: any): obj is RxapOnInit {
  return obj && typeof obj.rxapOnInit === 'function';
}
