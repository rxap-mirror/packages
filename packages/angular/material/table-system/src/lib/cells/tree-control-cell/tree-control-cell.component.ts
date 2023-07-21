import {
  ChangeDetectionStrategy,
  Component,
  DoCheck,
  Input,
  OnInit,
} from '@angular/core';
import { IconConfig } from '@rxap/utilities';
import { IconDirective } from '@rxap/material-directives/icon';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FlexModule } from '@angular/flex-layout/flex';
import { RowDataWithNode } from '@rxap/data-source/table/tree';
import { NgIf } from '@angular/common';

@Component({
  selector: 'rxap-tree-control-cell, td[rxap-tree-control-cell]',
  templateUrl: './tree-control-cell.component.html',
  styleUrls: [ './tree-control-cell.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    FlexModule,
    MatButtonModule,
    MatIconModule,
    IconDirective,
    NgIf,
  ],
})
export class TreeControlCellComponent implements OnInit, DoCheck {

  public offset!: string;
  public icon!: IconConfig;

  public expandIcon!: string;

  @Input('rxap-tree-control-cell')
  public element: RowDataWithNode<any>;

  public ngOnInit() {
    this.offset = (this.element.__node.depth * 24) + 'px';
    this.updateIcon();
  }

  public ngDoCheck() {
    this.updateIcon();
  }

  public toggleExpand() {
    return this.element.__node.toggleExpand();
  }

  private updateIcon(): void {
    this.icon = this.element.icon;
    if (this.element.__node.hasChildren) {
      if (this.element.__node.expanded) {
        this.expandIcon = 'expand_more';
      } else {
        this.expandIcon = 'expand_less';
      }
    } else {
      this.icon ??= { icon: 'subdirectory_arrow_right' };
    }
  }

}
