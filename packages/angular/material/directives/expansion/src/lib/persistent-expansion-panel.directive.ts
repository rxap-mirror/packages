import { Directive, OnDestroy, OnInit, input, inject } from '@angular/core';
import { MatExpansionPanel } from '@angular/material/expansion';
import { LocalStorageService } from '@rxap/ngx-memory';
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
  private readonly localStorage = inject<LocalStorageService>(LocalStorageService);
  readonly expansionPanel = inject<MatExpansionPanel>(MatExpansionPanel);


  public static BASE_KEY = 'mat-expansion-panel';
  // eslint-disable-next-line @angular-eslint/no-input-rename
  public readonly id = input.required<string>({ alias: "rxapPersistentExpansionPanel" });
  public readonly uuid = input<string>();
  public readonly group = input<string>();
  private subscription?: Subscription;

  public get key(): string {
    return [ PersistentExpansionPanelDirective.BASE_KEY, this.group(), this.uuid(), this.id(), 'isExpanded' ].join('/');
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


