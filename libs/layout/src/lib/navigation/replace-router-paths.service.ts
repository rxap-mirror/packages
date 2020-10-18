import { Injectable } from '@angular/core';
import {
  Observable,
  of
} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ReplaceRouterPathsService {

  public transform(routerLink: string[]): Observable<string[]> {
    return of(routerLink);
  }

}
