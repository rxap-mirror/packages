import {
  AfterContentInit,
  ChangeDetectorRef,
  ContentChildren,
  Directive,
  ElementRef,
  inject,
  Input,
  OnDestroy,
  QueryList,
} from '@angular/core';
import {
  MatExpansionPanel,
  MatExpansionPanelHeader,
} from '@angular/material/expansion';
import { DOMElement } from 'react';
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

  protected cdr = inject(ChangeDetectorRef);

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
        for (const panel of panelList) {
          this._expandedChangeSubscription.add(this.trackExpandState(panel));
          this.restoreState(panel);
        }
        this.cdr.detectChanges();
      }),
    ).subscribe();
  }

  protected restoreState(panel: MatExpansionPanel) {
    const identifier = this.getPanelIdentifier(panel);
    const expanded = this.isExpanded(identifier);
    if (expanded) {
      panel.open();
    }
  }

  protected getPanelIdentifier(panel: MatExpansionPanel): string {
    const headers = (panel.accordion as any)._headers as QueryList<MatExpansionPanelHeader>;
    const header = headers.find(item => item.panel === panel);
    const element = ((header as any)._element as ElementRef);
    const nativeElement = element.nativeElement as HTMLElement;
    const title = nativeElement.querySelector('mat-panel-title')?.textContent;
    return title ? this.hashString(title) : panel.id;
  }

  protected hashString(s: string): string {
    s = s.trim();
    let hash = 0, i, char;
    if (s.length === 0) return hash.toFixed(0);
    for (i = 0; i < s.length; i++) {
      char = s.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0; // Convert to 32bit integer
    }
    return hash.toFixed(0);
  }

  protected isExpanded(identifier: string) {
    const key = this.buildKey(identifier);
    return localStorage.getItem(key) === 'true';
  }

  protected buildKey(identifier: string): string {
    return [ 'rxapPersistentAccordion', this.key, identifier ].join('_');
  }

  protected trackExpandState(panel: MatExpansionPanel) {
    const identifier = this.getPanelIdentifier(panel);
    const key = this.buildKey(identifier);
    return panel.expandedChange.subscribe(expanded => {
      if (expanded) {
        localStorage.setItem(key, 'true');
      } else {
        localStorage.removeItem(key);
      }
    });
  }

}
