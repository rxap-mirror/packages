import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { finalize, share } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ConfigLoaderService {
  public readonly configs = new Map<string, any>();

  public readonly configLoading = new Map<string, Observable<any>>();

  constructor(
    @Inject(HttpClient)
    public readonly http: HttpClient
  ) {}

  public async load$<T = any>(url: string): Promise<T> {
    if (this.configs.has(url)) {
      return this.configs.get(url);
    }

    if (this.configLoading.has(url)) {
      return this.configLoading.get(url)!.toPromise();
    }

    const loading$ = this.http.get<T>(url).pipe(
      finalize(() => this.configLoading.delete(url)),
      share()
    );

    this.configLoading.set(url, loading$);

    return loading$.toPromise();
  }
}
