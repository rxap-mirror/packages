import {
  Directive,
  Input,
  OnInit,
  Inject,
  OnDestroy
} from '@angular/core';
import { Required } from '@rxap/utilities';
import { MatExpansionPanel } from '@angular/material/expansion';
import { tap } from 'rxjs/operators';
import { LocalStorageService } from '@rxap/services';
import { Subscription } from 'rxjs';

@Directive({
  selector:   'mat-expansion-panel[rxapPersistentExpansionPanel]',
  standalone: true
})
export class PersistentExpansionPanelDirective implements OnInit, OnDestroy {

  public static BASE_KEY = 'mat-expansion-panel';

  public get key(): string {
    return [ PersistentExpansionPanelDirective.BASE_KEY, this.group, this.uuid, this.id, 'isExpanded' ].join('/');
  }

  public get isExpanded(): boolean {
    return this.localStorage.has(this.key);
  }

  // tslint:disable-next-line:no-input-rename
  @Input('rxapPersistentExpansionPanel')
  @Required
  public id!: string;
  @Input()
  public uuid?: string;
  @Input()
  public group?: string;

  private subscription?: Subscription;

  constructor(
    @Inject(LocalStorageService)
    private readonly localStorage: LocalStorageService,
    @Inject(MatExpansionPanel)
    public readonly expansionPanel: MatExpansionPanel
  ) { }

  public ngOnInit() {
    if (this.isExpanded) {
      this.expansionPanel.open();
    } else {
      this.expansionPanel.close();
    }
    this.subscription = this.expansionPanel.expandedChange.pipe(
      tap(isExpanded => {
        if (isExpanded) {
          this.localStorage.set(this.key, 'true');
        } else {
          this.localStorage.remove(this.key);
        }
      })
    ).subscribe();
  }

  public ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

}


