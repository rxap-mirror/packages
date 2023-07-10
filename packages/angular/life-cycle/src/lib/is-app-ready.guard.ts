import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {LifeCycleService} from './life-cycle.service';

@Injectable({
  providedIn: 'root',
})
export class IsAppReadyGuard {

  constructor(private readonly lifecycle: LifeCycleService) {
  }

  public canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean> {
    console.debug('[IsAppReadyGuard] can activate', state.url);
    return this.lifecycle.whenReady(() => true);
  }

}
