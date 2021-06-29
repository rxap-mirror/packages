import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ConfigService } from '@rxap/config';

@Injectable({ providedIn: 'root' })
export class SidenavComponentService {

  public readonly collapsed$ = new BehaviorSubject(false);

  constructor(private readonly config: ConfigService) {
    this.collapsed$.next(this.config.get('navigation.collapsed', this.collapsed$.value));
  }

  public toggleNavigationCollapse(): void {
    this.collapsed$.next(!this.collapsed$.value);
  }

}
