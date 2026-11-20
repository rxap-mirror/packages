import {
  PortalModule,
  TemplatePortal,
} from '@angular/cdk/portal';
import { FlatTreeControl } from '@angular/cdk/tree';
import { AsyncPipe, NgClass, NgStyle } from '@angular/common';
import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Inject,
  isDevMode,
  OnInit,
  Optional,
  Renderer2,
  signal,
  ViewContainerRef,
  input,
  output,
  contentChild,
  viewChild
} from '@angular/core';
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
]
})
export class TreeComponent<Data extends WithIdentifier & WithChildren = any>
  implements OnInit, AfterContentInit {
  public treeControl: FlatTreeControl<Node<Data>>;
  public readonly dataSource = input.required<TreeDataSource<Data>>();
  public readonly contentEditableMethod = input<Method<any, string | null> | null>();
  public readonly toDisplay = input<NodeToDisplayFunction<any>>();
  public readonly getIcon = input<NodeGetIconFunction<any>>();
  public readonly getType = input<NodeGetTypeFunction<any>>();
  public readonly getStyle = input<NodeGetStyleFunction<any>>();
  public readonly multiple = input(false);
  public readonly hasDetails = input<NodeHasDetailsFunction<any>>();
  public readonly content = contentChild(TreeContentDirective);
  public readonly hideLeafIcon = input(false);
  public readonly id = input<string>();
  public readonly details = output();
  public readonly dividerOffset = input('256px');
  public portal: TemplatePortal | null = null;
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

  constructor(
    @Inject(ViewContainerRef)
    private readonly viewContainerRef: ViewContainerRef,
    @Inject(ChangeDetectorRef)
    private readonly cdr: ChangeDetectorRef,
    @Optional()
    @Inject(RXAP_TREE_CONTENT_EDITABLE_METHOD)
      contentEditableMethod: Method<any, string | null> | null,
    private readonly renderer: Renderer2,
    private readonly elementRef: ElementRef<HTMLElement>,
    @Optional()
    @Inject(RXAP_FORM_DEFINITION)
    public readonly searchForm: SearchForm | null,
  ) {
    this.treeControl           = new FlatTreeControl(this.getLevel, this.isExpandable);
    this.contentEditableMethod = contentEditableMethod;
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

  public ngOnInit() {
    dataSource.searchForm = this.searchForm;
    dataSource.setTreeControl(this.treeControl);
    dataSource.setToDisplay(this.toDisplay());
    dataSource.setGetIcon(this.getIcon());
    dataSource.setHasDetails(this.hasDetails());
    dataSource.setGetStyle(this.getStyle());
    dataSource.setGetType(this.getType());
    this.multiple = dataSource.metadata.selectMultiple ?? this.multiple();

    if (dataSource.selected.hasValue()) {
      dataSource.selected.selected.forEach((node) =>
        this.openDetails(node),
      );
    }

    const cachedOffset = localStorage.getItem(this.cacheId);
    if (cachedOffset && cachedOffset.match(/^(\d+\.)?\d+px$/)) {
      this.setDividerOffset(cachedOffset);
    } else if (isDevMode()) {
      console.log('Divider offset cache is not available or invalid: ' + cachedOffset);
    }
  }

  public ngAfterContentInit(): void {
    this.dataSource().selected.changed
    .pipe(
      map(($event) => $event.source.selected),
      startWith(this.dataSource().selected.selected),
      tap((selected) => selected.forEach((node) => this.openDetails(node))),
    )
    .subscribe();
  }

  @DebounceCall(100)
  public openDetails(node: Node<Data>): void {
    const content = this.content();
    if (content) {
      this.portal = new TemplatePortal<any>(
        content.template,
        this.viewContainerRef,
        {
          $implicit: node.item,
          node,
        },
      );
      this.cdr.markForCheck();
    }
    this.details.emit(node.item);
  }

  public onContentEditableChange(value: string | null, node: Node<Data>) {
    return this.contentEditableMethod()?.call(value, node.item, node);
  }


  onMousedown() {
    this._moveDivider = true;
  }

  @HostListener('mouseup')
  onMouseup() {
    this._moveDivider = false;
  }

  @HostListener('mousemove', [ '$event' ])
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
    this.dividerOffset = offset;
    const treeContainer = this.treeContainer();
    this.renderer.setStyle(treeContainer.nativeElement, 'max-width', offset);
    this.renderer.setStyle(treeContainer.nativeElement, 'min-width', offset);
    this.renderer.setStyle(treeContainer.nativeElement, 'flex-basis', offset);
    localStorage.setItem(this.cacheId, offset);
  }
}
