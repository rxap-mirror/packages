import {
  Injectable,
  Provider,
} from '@angular/core';
import { LocalStorageService } from '@rxap/services';

@Injectable()
export class LocalStorageServiceFake implements LocalStorageService {

  public readonly localStorage = new Map<string, string>();

  public get(key: string): string | null {
    return this.localStorage.get(key) ?? null;
  }

  public has(key: string): boolean {
    return this.localStorage.has(key);
  }

  public remove(key: string): void {
    this.localStorage.delete(key);
  }

  public set(key: string, value: any): void {
    if (typeof value !== 'string') {
      this.localStorage.set(key, JSON.stringify(value));
    } else {
      this.localStorage.set(key, value);
    }
  }

}

export const LOCAL_STORAGE_SERVICE_FAKE_PROVIDER: Provider[] = [
  LocalStorageServiceFake,
  {
    provide:     LocalStorageService,
    useExisting: LocalStorageServiceFake,
  },
];
