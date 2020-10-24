import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SidenavComponentService {


  public readonly collapsed$ = new BehaviorSubject(false);

  public toggleNavigationCollapse(): void {
    this.collapsed$.next(!this.collapsed$.value);
  }

}
