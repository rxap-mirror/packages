import { Injectable } from '@angular/core';
import { KeyValue } from '@rxap/utilities';
import { Subject } from 'rxjs';

export interface Version {
  name: string;
  hash: string;
  semantic: string;
}

@Injectable({ providedIn: 'root' })
export class VersionService {

  public update$ = new Subject<void>();
  private modules = new Map<string, Version>();

  public setModule(moduleId: string, version: Version): void {
    this.modules.set(moduleId, version);
    this.update$.next();
  }

  public get(): KeyValue<Version> {
    return Array.from(this.modules.entries())
                .reduce((map, [ moduleId, version ]) => ({
                  ...map,
                  [moduleId]: version,
                }), {});
  }

}
