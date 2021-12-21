import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Optional,
  Output,
  ViewContainerRef,
  ElementRef,
  ViewChild,
  Renderer2,
  HostListener
} from '@angular/core';
import {
  DebounceCall,
  Required,
  WithChildren,
  WithIdentifier
} from '@rxap/utilities';
import { FlatTreeControl } from '@angular/cdk/tree';
import {
  map,
  startWith,
  tap
} from 'rxjs/operators';
import { TreeContentDirective } from './tree-content.directive';
import { TemplatePortal } from '@angular/cdk/portal';
import { RXAP_TREE_CONTENT_EDITABLE_METHOD } from './tokens';
import { TreeDataSource } from './tree.data-source';
import {
  Method,
  Node,
  NodeGetIconFunction,
  NodeHasDetailsFunction,
  NodeToDisplayFunction
} from '@rxap/utilities/rxjs';

@Component({
  // tslint:disable-next-line:component-selector
  selector:        'rxap-tree',
  templateUrl:     './tree.component.html',
  styleUrls:       [ './tree.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeComponent<Data extends WithIdentifier & WithChildren = any>
  implements OnInit, AfterContentInit {
  public get nodeDisplayEditable(): boolean {
    return !!this.contentEditableMethod;
  }

  public treeControl: FlatTreeControl<Node<Data>>;
  @Input()
  @Required
  public dataSource!: TreeDataSource<Data>;
  @Input()
  public contentEditableMethod?: Method<any, string | null> | null;
  @Input()
  public toDisplay?: NodeToDisplayFunction<any>;

  @Input()
  public getIcon?: NodeGetIconFunction<any>;

  @Input()
  public multiple: boolean = false;

  @Input()
  public hasDetails?: NodeHasDetailsFunction<any>;

  @ContentChild(TreeContentDirective, { static: true })
  public content?: TreeContentDirective;

  @Input()
  public hideLeafIcon: boolean = false;

  @Output()
  public details = new EventEmitter();

  public portal: TemplatePortal | null = null;
  public getLevel                      = (node: Node<Data>) => node.depth;
  public isExpandable                  = (node: Node<Data>) => node.hasChildren;
  public hasChild                      = (_: number, nodeData: Node<Data>) => nodeData.hasChildren;

  @ViewChild('treeContainer', { static: true })
  public treeContainer!: ElementRef;

  /**
   * Indicates that the divider is moved with mouse down
   * @private
   */
  private _moveDivider = false;

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
    private readonly renderer: Renderer2
  ) {
    this.treeControl = new FlatTreeControl(this.getLevel, this.isExpandable);
    this.contentEditableMethod = contentEditableMethod;
  }

  public ngOnInit() {
    this.dataSource.setTreeControl(this.treeControl);
    this.dataSource.setToDisplay(this.toDisplay);
    this.dataSource.setGetIcon(this.getIcon);
    this.dataSource.setHasDetails(this.hasDetails);
    this.multiple = this.dataSource.metadata.selectMultiple ?? this.multiple;

    if (this.dataSource.selected.hasValue()) {
      this.dataSource.selected.selected.forEach((node) =>
        this.openDetails(node)
      );
    }
  }

  public ngAfterContentInit(): void {
    this.dataSource.selected.changed
      .pipe(
        map(($event) => $event.source.selected),
        startWith(this.dataSource.selected.selected),
        tap((selected) => selected.forEach((node) => this.openDetails(node)))
      )
      .subscribe();
  }

  @DebounceCall(100)
  public openDetails(node: Node<Data>): void {
    if (this.content) {
      this.portal = new TemplatePortal<any>(
        this.content.template,
        this.viewContainerRef,
        {
          $implicit: node.item,
          node,
        }
      );
      this.cdr.markForCheck();
    }
    this.details.emit(node.item);
  }

  public onContentEditableChange(value: string | null, node: Node<Data>) {
    return this.contentEditableMethod?.call(value, node.item, node);
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
        this._treeContainerWidth = this.treeContainer.nativeElement.clientWidth as number;
      }
      this._treeContainerWidth = $event.clientX - 75;
      const width              = this._treeContainerWidth + 'px';
      this.renderer.setStyle(this.treeContainer.nativeElement, 'max-width', width);
      this.renderer.setStyle(this.treeContainer.nativeElement, 'min-width', width);
      this.renderer.setStyle(this.treeContainer.nativeElement, 'flex-basis', width);
    }
  }
}
