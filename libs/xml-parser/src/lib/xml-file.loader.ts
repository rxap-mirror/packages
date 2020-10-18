import {
  Injectable,
  Inject
} from '@angular/core';
import {
  finalize,
  share,
  tap
} from 'rxjs/operators';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class XmlFileLoader {

  private readonly xmlFiles        = new Map<string, string>();
  private readonly xmlFilesLoading = new Map<string, Observable<string>>();

  constructor(@Inject(HttpClient) public http: HttpClient) {
  }

  public async getXmlFile$(url: string): Promise<string> {
    if (this.has(url)) {
      return this.get(url)!;
    }
    if (this.xmlFilesLoading.has(url)) {
      return this.xmlFilesLoading.get(url)!.toPromise();
    }

    const request$ = this.http.get(url, { responseType: 'text' }).pipe(
      tap(xml => this.set(url, xml)),
      finalize(() => this.xmlFilesLoading.delete(url)),
      share()
    );

    this.xmlFilesLoading.set(url, request$);

    return request$.toPromise();

  }

  public set(url: string, xml: string): void {
    this.xmlFiles.set(url, xml);
  }

  public has(url: string): boolean {
    return this.xmlFiles.has(url);
  }

  public get(url: string): string {
    if (!this.has(url)) {
      throw new Error(`Xml file with url '${url}' is not defined!`);
    }
    return this.xmlFiles.get(url)!;
  }

}
