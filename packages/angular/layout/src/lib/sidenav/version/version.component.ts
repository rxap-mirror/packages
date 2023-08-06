import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  Version,
  VersionService,
} from '@rxap/services';
import {
  KeyValue,
  Required,
} from '@rxap/utilities';
import { tap } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import {
  KeyValuePipe,
  NgFor,
} from '@angular/common';
import { FlexModule } from '@angular/flex-layout/flex';

@Component({
  selector: 'rxap-version',
  templateUrl: './version.component.html',
  styleUrls: [ './version.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [ FlexModule, NgFor, KeyValuePipe ],
})
export class VersionComponent implements OnInit, OnDestroy {

  public modules!: KeyValue<Version>;

  private subscription?: Subscription;

  constructor(
    @Inject(VersionService) private version: VersionService,
  ) {
  }

  public ngOnInit(): void {
    this.modules = this.version.get();
    this.subscription = this.version.update$.pipe(
      tap(() => this.modules = this.version.get()),
    ).subscribe();
  }

  public ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

}
