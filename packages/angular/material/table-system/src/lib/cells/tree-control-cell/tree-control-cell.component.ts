import {
  ChangeDetectionStrategy,
  Component,
  DoCheck,
  computed,
  input
} from '@angular/core';
import { IconConfig } from '@rxap/utilities';
import { IconDirective } from '@rxap/material-directives/icon';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RowDataWithNode } from '@rxap/data-source/table/tree';


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

  // the tree node state (expanded) is not reactive, therefore the icons must be re-evaluated on each check
  public ngDoCheck() {
    this.updateIcon();
  }

  public toggleExpand() {
    return this.element().__node.toggleExpand();
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
      this.icon ??= { icon: 'subdirectory_arrow_right' };
    }
  }

}
