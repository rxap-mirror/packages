import {
  Directive,
  Inject,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { MatExpansionPanel } from '@angular/material/expansion';
import { LocalStorageService } from '@rxap/services';
import { Required } from '@rxap/utilities';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * @deprecated use the PersistentAccordionDirective instead
 */
@Directive({
  selector: 'mat-expansion-panel[rxapPersistentExpansionPanel]',
  standalone: true,
})
export class PersistentExpansionPanelDirective implements OnInit, OnDestroy {

  public static BASE_KEY = 'mat-expansion-panel';
  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input({
    required: true,
    alias: 'rxapPersistentExpansionPanel',
  })
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
    public readonly expansionPanel: MatExpansionPanel,
  ) {
  }

  public get key(): string {
    return [ PersistentExpansionPanelDirective.BASE_KEY, this.group, this.uuid, this.id, 'isExpanded' ].join('/');
  }

  public get isExpanded(): boolean {
    return this.localStorage.has(this.key);
  }

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
      }),
    ).subscribe();
  }

  public ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

}


