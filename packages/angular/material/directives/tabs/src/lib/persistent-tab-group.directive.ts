import {
  Directive,
  Inject,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { MatTabGroup } from '@angular/material/tabs';
import { LocalStorageService } from '@rxap/services';
import { Required } from '@rxap/utilities';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';

@Directive({
  selector: 'mat-tab-group[rxapPersistentTabGroup]',
  standalone: true,
})
export class PersistentTabGroupDirective implements OnInit, OnDestroy {

  public static BASE_KEY = 'mat-expansion-panel';
  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('rxapPersistentTabGroup')
  @Required
  public id!: string;
  @Input()
  public uuid?: string;
  private subscription?: Subscription;

  constructor(
    @Inject(LocalStorageService)
    private readonly localStorage: LocalStorageService,
    @Inject(MatTabGroup)
    public readonly tabGroup: MatTabGroup,
  ) { }

  public get key(): string {
    return [ PersistentTabGroupDirective.BASE_KEY, this.uuid, this.id, 'isExpanded' ].join('/');
  }

  public get selectedIndex(): null | number {
    return Number(this.localStorage.get(this.key) ?? 0);
  }

  public ngOnInit() {
    this.tabGroup.selectedIndex = this.selectedIndex;
    this.subscription = this.tabGroup.selectedIndexChange.pipe(
      tap(index => this.localStorage.set(this.key, index.toFixed(0))),
    ).subscribe();
  }

  public ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

}
