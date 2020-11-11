export interface ProviderObject {
  provide: string;
  useClass?: string;
  useFactory?: string;
  deps?: string[];
  useExisting?: string;
  useValue?: string;
}
