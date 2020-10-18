import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ResetService {

  public view$       = new Subject<void>();
  public dataSource$ = new Subject<void>();

  public resetView() {
    this.view$.next();
  }

  public resetDataSource() {
    // TODO : iterate over the list of active DataSources
    this.dataSource$.next();
  }

  public resetAll() {
    this.resetDataSource();
    this.resetView();
  }

}
