import {
  afterRenderEffect,
  contentChildren,
  Directive,
  ElementRef,
  input,
  QueryList,
  untracked,
} from '@angular/core';
import {
  MatExpansionPanel,
  MatExpansionPanelHeader,
} from '@angular/material/expansion';
import { Subscription } from 'rxjs';

@Directive({
  selector: 'mat-accordion[rxapPersistentAccordion]',
  standalone: true,
})
export class PersistentAccordionDirective {

  public readonly key = input.required<string>({ alias: "rxapPersistentAccordion" });

  private readonly expansionPanel = contentChildren(MatExpansionPanel);

  constructor() {
    // runs after render, once the panels and their headers are resolved, and again whenever the panels change
    afterRenderEffect((onCleanup) => {
      const panels = this.expansionPanel();
      const subscription = new Subscription();
      untracked(() => {
        for (const panel of panels) {
          subscription.add(this.trackExpandState(panel));
          this.restoreState(panel);
        }
      });
      onCleanup(() => subscription.unsubscribe());
    });
  }

  protected restoreState(panel: MatExpansionPanel) {
    const identifier = this.getPanelIdentifier(panel);
    const expanded = this.isExpanded(identifier);
    if (expanded) {
      panel.open();
    }
  }

  protected getPanelIdentifier(panel: MatExpansionPanel): string {
    const headers = (panel.accordion as any)?._headers as QueryList<MatExpansionPanelHeader> | undefined;
    const header = headers?.find(item => item.panel === panel);
    const element = (header as any)?._element as ElementRef | undefined;
    const nativeElement = element?.nativeElement as HTMLElement | undefined;
    const title = nativeElement?.querySelector('mat-panel-title')?.textContent;
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
    return [ 'rxapPersistentAccordion', this.key(), identifier ].join('_');
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
