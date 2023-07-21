import {
  AfterContentInit,
  ContentChildren,
  Directive,
  Input,
  OnDestroy,
  QueryList,
} from '@angular/core';
import { MatExpansionPanel } from '@angular/material/expansion';
import {
  startWith,
  Subscription,
} from 'rxjs';
import { tap } from 'rxjs/operators';

@Directive({
  selector: 'mat-accordion[rxapPersistentAccordion]',
  standalone: true,
})
export class PersistentAccordionDirective implements AfterContentInit, OnDestroy {

  @Input({
    required: true,
    alias: 'rxapPersistentAccordion',
  })
  public key!: string;

  @ContentChildren(MatExpansionPanel, { emitDistinctChangesOnly: true })
  private expansionPanel!: QueryList<MatExpansionPanel>;

  private _subscription?: Subscription;

  private _expandedChangeSubscription?: Subscription;

  ngOnDestroy() {
    this._subscription?.unsubscribe();
    this._expandedChangeSubscription?.unsubscribe();
  }

  public ngAfterContentInit() {
    this._subscription = this.expansionPanel.changes.pipe(
      startWith(this.expansionPanel.toArray()),
      tap(panelList => {
        this._expandedChangeSubscription?.unsubscribe();
        this._expandedChangeSubscription = new Subscription();
        for (let i = 0; i < panelList.length; i++) {
          const panel = panelList[i];
          this._expandedChangeSubscription.add(this.trackExpandState(panel, i));
          const key = [ this.key, i ].join('-');
          const expanded = localStorage.getItem(key);
          if (expanded) {
            panel.open();
          }
        }
      }),
    ).subscribe();
  }

  private trackExpandState(panel: MatExpansionPanel, index: number) {
    const key = [ this.key, index ].join('-');
    return panel.expandedChange.subscribe(expanded => {
      if (expanded) {
        localStorage.setItem(key, 'true');
      } else {
        localStorage.removeItem(key);
      }
    });
  }

}
