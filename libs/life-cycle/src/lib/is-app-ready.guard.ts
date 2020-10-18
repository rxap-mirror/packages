import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import { Observable } from 'rxjs';
import { LifeCycleService } from './life-cycle.service';

@Injectable({
  providedIn: 'root'
})
export class IsAppReadyGuard implements CanActivate {

  constructor(private readonly lifecycle: LifeCycleService) {}

  public canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    console.debug('[IsAppReadyGuard] can activate', state.url);
    return this.lifecycle.whenReady(() => true);
  }

}
