import {
  Pipe,
  PipeTransform
} from '@angular/core';
import { Observable } from 'rxjs';
import { ReplaceRouterPathsService } from './replace-router-paths.service';

@Pipe({
  name: 'replaceRouterPaths'
})
export class ReplaceRouterPathsPipe implements PipeTransform {
  constructor(
    public rrp: ReplaceRouterPathsService
  ) {}

  transform(routerLink: string[]): Observable<string[]> {
    return this.rrp.transform(routerLink);
  }
}
