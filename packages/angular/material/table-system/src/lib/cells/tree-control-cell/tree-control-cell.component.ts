import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DoCheck,
  computed,
  inject,
  input
} from '@angular/core';
import { IconConfig } from '@rxap/utilities';
import { IconDirective } from '@rxap/material-directives/icon';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RowDataWithNode } from '@rxap/data-source/table/tree';


const LEAF_ICON: IconConfig = { icon: 'subdirectory_arrow_right' };

@Component({
    selector: 'rxap-tree-control-cell, td[rxap-tree-control-cell]',
    templateUrl: './tree-control-cell.component.html',
    styleUrls: ['./tree-control-cell.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
    MatButtonModule,
    MatIconModule,
    IconDirective
]
})
export class TreeControlCellComponent implements DoCheck {

  public readonly offset = computed(() => (this.element().__node.depth * 24) + 'px');

  public icon!: IconConfig;

  public expandIcon!: string;

  public readonly element = input<RowDataWithNode<any>>(undefined, { alias: "rxap-tree-control-cell" });

  private readonly cdr = inject(ChangeDetectorRef);

  // The tree node state (expanded) is not reactive, therefore the icons must be re-evaluated on each check.
  // ngDoCheck is part of the parent view and only runs when the parent view is refreshed (zoneless: when it is
  // dirty). The OnPush view of this cell must therefore be marked for check if the evaluated icons changed.
  public ngDoCheck() {
    this.refresh();
  }

  public toggleExpand() {
    const result = this.element().__node.toggleExpand();
    // the expanded flag of the node is changed synchronously. The click event only dirties the view of this cell, the
    // parent view (and with it ngDoCheck) is not necessarily refreshed, therefore the icons are updated here
    this.refresh();
    // the node may load its children asynchronously (hasChildren can change)
    return Promise.resolve(result).finally(() => this.refresh());
  }

  private refresh(): void {
    const icon = this.icon;
    const expandIcon = this.expandIcon;
    this.updateIcon();
    if (icon !== this.icon || expandIcon !== this.expandIcon) {
      this.cdr.markForCheck();
    }
  }

  private updateIcon(): void {
    this.icon = this.element().icon;
    const element = this.element();
    if (element.__node.hasChildren) {
      if (element.__node.expanded) {
        this.expandIcon = 'expand_more';
      } else {
        this.expandIcon = 'expand_less';
      }
    } else {
      this.icon ??= LEAF_ICON;
    }
  }

}
