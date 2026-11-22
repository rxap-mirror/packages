import { Injectable, inject } from '@angular/core';
import {
  firstValueFrom,
  Observable,
} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import {
  finalize,
  share,
  tap,
} from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ConfigLoaderService {
  readonly http = inject<HttpClient>(HttpClient);

  public readonly configs = new Map<string, any>();

  public readonly configLoading = new Map<string, Observable<any>>();

  public async load$<T = any>(url: string): Promise<T> {
    if (this.configs.has(url)) {
      return this.configs.get(url);
    }

    if (this.configLoading.has(url)) {
      return firstValueFrom(this.configLoading.get(url)!);
    }

    const loading$ = this.http.get<T>(url).pipe(
      tap(config => this.configs.set(url, config)),
      finalize(() => this.configLoading.delete(url)),
      share(),
    );

    this.configLoading.set(url, loading$);

    return firstValueFrom(loading$);
  }
}
