import {
  PortalModule,
  TemplatePortal,
} from '@angular/cdk/portal';
import { FlatTreeControl } from '@angular/cdk/tree';
import { AsyncPipe, NgClass, NgStyle } from '@angular/common';
import { afterNextRender, ChangeDetectionStrategy, Component, computed, effect, ElementRef, isDevMode, linkedSignal, signal, untracked, ViewContainerRef, input, output, contentChild, viewChild, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTreeModule } from '@angular/material/tree';
import { ContenteditableDirective } from '@rxap/contenteditable';
import {
  Node,
  NodeGetIconFunction,
  NodeGetStyleFunction,
  NodeGetTypeFunction,
  NodeHasDetailsFunction,
  NodeToDisplayFunction,
} from '@rxap/data-structure-tree';
import { RXAP_FORM_DEFINITION } from '@rxap/forms';
import { IconDirective } from '@rxap/material-directives/icon';
import { Method } from '@rxap/pattern';
import {
  DebounceCall,
  WithChildren,
  WithIdentifier,
} from '@rxap/utilities';
import {
  map,
  startWith,
  tap,
} from 'rxjs/operators';
import { SearchForm } from './search.form';
import { RXAP_TREE_CONTENT_EDITABLE_METHOD } from './tokens';
import { TreeContentDirective } from './tree-content.directive';
import { TreeDataSource } from './tree.data-source';

@Component({
    selector: 'rxap-tree',
    templateUrl: './tree.component.html',
    styleUrls: ['./tree.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
    NgStyle,
    MatProgressBarModule,
    MatTreeModule,
    MatIconModule,
    IconDirective,
    MatCheckboxModule,
    MatButtonModule,
    ContenteditableDirective,
    MatProgressSpinnerModule,
    MatDividerModule,
    PortalModule,
    AsyncPipe,
    NgClass
],
    host: {
      '(mouseup)': 'onMouseup()',
      '(mousemove)': 'onMousemove($event)',
    },
})
export class TreeComponent<Data extends WithIdentifier & WithChildren = any> {
  private readonly viewContainerRef = inject<ViewContainerRef>(ViewContainerRef);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly searchForm = inject<SearchForm | null>(RXAP_FORM_DEFINITION, { optional: true });

  public treeControl: FlatTreeControl<Node<Data>>;
  public readonly dataSource = input.required<TreeDataSource<Data>>();
  public readonly contentEditableMethodInput = input<Method<any, string | null> | null>(null, { alias: 'contentEditableMethod' });
  private readonly injectedContentEditableMethod = inject<Method<any, string | null> | null>(RXAP_TREE_CONTENT_EDITABLE_METHOD, { optional: true });
  public readonly contentEditableMethod = computed(() => this.contentEditableMethodInput() ?? this.injectedContentEditableMethod);
  public readonly toDisplay = input<NodeToDisplayFunction<any>>();
  public readonly getIcon = input<NodeGetIconFunction<any>>();
  public readonly getType = input<NodeGetTypeFunction<any>>();
  public readonly getStyle = input<NodeGetStyleFunction<any>>();
  public readonly multipleInput = input(false, { alias: 'multiple' });
  public readonly multiple = computed(() => this.dataSource().metadata?.selectMultiple ?? this.multipleInput());
  public readonly hasDetails = input<NodeHasDetailsFunction<any>>();
  public readonly content = contentChild(TreeContentDirective);
  public readonly hideLeafIcon = input(false);
  public readonly id = input<string>();
  public readonly details = output();
  public readonly dividerOffsetInput = input('256px', { alias: 'dividerOffset' });
  public readonly dividerOffset = linkedSignal(() => this.dividerOffsetInput());
  public readonly portal = signal<TemplatePortal | null>(null);
  public readonly treeContainer = viewChild.required<ElementRef>('treeContainer');

  public readonly showTreeNavigation = signal(true);

  /**
   * Indicates that the divider is moved with mouse down
   * @private
   */
  private _moveDivider                       = false;
  /**
   * Holds the current tree container width.
   * If null the move divider feature was not yet used and the initial
   * container width is not calculated
   * @private
   */
  private _treeContainerWidth: number | null = null;

  constructor() {
    this.treeControl = new FlatTreeControl(this.getLevel, this.isExpandable);

    effect(() => {
      const dataSource = this.dataSource();
      const toDisplay = this.toDisplay();
      const getIcon = this.getIcon();
      const hasDetails = this.hasDetails();
      const getStyle = this.getStyle();
      const getType = this.getType();
      untracked(() => {
        dataSource.searchForm = this.searchForm;
        dataSource.setTreeControl(this.treeControl);
        dataSource.setToDisplay(toDisplay);
        dataSource.setGetIcon(getIcon);
        dataSource.setHasDetails(hasDetails);
        dataSource.setGetStyle(getStyle);
        dataSource.setGetType(getType);
      });
    });

    effect((onCleanup) => {
      const selected = this.dataSource().selected;
      const subscription = untracked(() => selected.changed
        .pipe(
          map(($event) => $event.source.selected),
          startWith(selected.selected),
          tap((nodes) => nodes.forEach((node) => this.openDetails(node))),
        )
        .subscribe());
      onCleanup(() => subscription.unsubscribe());
    });

    afterNextRender(() => {
      const cachedOffset = localStorage.getItem(this.cacheId);
      if (cachedOffset && cachedOffset.match(/^(\d+\.)?\d+px$/)) {
        this.dividerOffset.set(cachedOffset);
      } else if (isDevMode()) {
        console.log('Divider offset cache is not available or invalid: ' + cachedOffset);
      }
    });
  }

  public get nodeDisplayEditable(): boolean {
    return !!this.contentEditableMethod();
  }

  public get cacheId() {
    return [ 'rxap', 'tree', this.id() ].join('/');
  }

  public getLevel = (node: Node<Data>) => node.depth;

  public isExpandable = (node: Node<Data>) => node.hasChildren;

  public hasChild = (_: number, nodeData: Node<Data>) => nodeData.hasChildren;

  @DebounceCall(100)
  public openDetails(node: Node<Data>): void {
    const content = this.content();
    if (content) {
      this.portal.set(new TemplatePortal<any>(
        content.template,
        this.viewContainerRef,
        {
          $implicit: node.item,
          node,
        },
      ));
    }
    this.details.emit(node.item);
  }

  public onContentEditableChange(value: string | null, node: Node<Data>) {
    return this.contentEditableMethod()?.call(value, node.item, node);
  }


  onMousedown() {
    this._moveDivider = true;
  }

  onMouseup() {
    this._moveDivider = false;
  }

  onMousemove($event: MouseEvent) {
    if (this._moveDivider) {
      if (!this._treeContainerWidth) {
        this._treeContainerWidth = this.treeContainer().nativeElement.clientWidth as number;
      }
      const rect               = this.elementRef.nativeElement.getBoundingClientRect();
      this._treeContainerWidth = Math.min(Math.max($event.clientX - (
        rect.left + 12
      ), 128), rect.right - rect.left - 128);
      const offset             = this._treeContainerWidth + 'px';
      this.setDividerOffset(offset);
    }
  }

  toggleTreeNavigation() {
    this.showTreeNavigation.update((value) => !value);
  }

  private setDividerOffset(offset: string) {
    this.dividerOffset.set(offset);
    localStorage.setItem(this.cacheId, offset);
  }
}
