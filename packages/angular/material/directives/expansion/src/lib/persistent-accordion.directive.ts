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
import { Showcase } from '@ng-prism/core';

@Showcase<PersistentAccordionDirective>({
  title: 'Persistent Accordion',
  category: 'Material Directives',
  description: 'Stores the expanded state of the panels of a `mat-accordion` in the local storage and restores it on the next visit.',
  status: 'stable',
  host: {
    template: '<mat-accordion rxapPersistentAccordion style="display: block; width: 360px"><mat-expansion-panel><mat-expansion-panel-header><mat-panel-title>First panel</mat-panel-title></mat-expansion-panel-header>Content of the first panel</mat-expansion-panel><mat-expansion-panel><mat-expansion-panel-header><mat-panel-title>Second panel</mat-panel-title></mat-expansion-panel-header>Content of the second panel</mat-expansion-panel></mat-accordion>',
  },
  imports: [
    { name: 'MatAccordion', from: '@angular/material/expansion' },
    { name: 'MatExpansionPanel', from: '@angular/material/expansion' },
    { name: 'MatExpansionPanelHeader', from: '@angular/material/expansion' },
    { name: 'MatExpansionPanelTitle', from: '@angular/material/expansion' },
  ],
  variants: [{ name: 'Default', inputs: { key: 'prism-accordion' } }],
})
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
