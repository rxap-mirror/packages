import { Injectable } from '@angular/core';
import { RxapRowAction } from './row-action';
import { compile } from 'handlebars';
import {
  HttpRequest,
  HttpClient
} from '@angular/common/http';
import { first } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class TableActionHandler<Data> {

  constructor(
    public readonly http: HttpClient,
    public readonly router: Router
  ) {}

  public async handel(action: RxapRowAction<Data>, row: Data): Promise<any> {
    if (action.url) {
      const urlTemplate = compile(action.url);
      const url         = urlTemplate({ row });
      await this.http.request(new HttpRequest(action.httpMethod as any, url))
                .pipe(first())
                .toPromise();
    }
    if (action.routerLink) {
      const routerLinkTemplate = compile(action.routerLink);
      const routerLink         = routerLinkTemplate({ row });
      await this.router.navigateByUrl(routerLink);
    }
    return action.refresh || false;
  }

}
