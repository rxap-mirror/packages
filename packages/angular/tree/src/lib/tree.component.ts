import { PortalModule, TemplatePortal } from '@angular/cdk/portal';
import { FlatTreeControl } from '@angular/cdk/tree';
import { AsyncPipe, NgClass, NgForOf, NgIf, NgStyle } from '@angular/common';
import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ElementRef,
  EventEmitter,
  HostListener,
  Inject,
  Input,
  isDevMode,
  OnInit,
  Optional,
  Output,
  Renderer2,
  signal,
  ViewChild,
  ViewContainerRef,
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
import { IconDirective } from '@rxap/material-directives/icon';
import { Method } from '@rxap/pattern';
import { DebounceCall, WithChildren, WithIdentifier } from '@rxap/utilities';
import { map, startWith, tap } from 'rxjs/operators';
import { RXAP_TREE_CONTENT_EDITABLE_METHOD } from './tokens';
import { TreeContentDirective } from './tree-content.directive';
import { TreeDataSource } from './tree.data-source';
import { SearchForm } from './search.form';
import { RXAP_FORM_DEFINITION } from '@rxap/forms';

@Component({
  selector: 'rxap-tree',
  templateUrl: './tree.component.html',
  styleUrls: [ './tree.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgStyle,
    NgIf,
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
    NgClass,
    NgForOf,
  ],
})
export class TreeComponent<Data extends WithIdentifier & WithChildren = any>
  implements OnInit, AfterContentInit {
  public treeControl: FlatTreeControl<Node<Data>>;
  @Input({required: true})
  public dataSource!: TreeDataSource<Data>;
  @Input()
  public contentEditableMethod?: Method<any, string | null> | null;
  @Input()
  public toDisplay?: NodeToDisplayFunction<any>;
  @Input()
  public getIcon?: NodeGetIconFunction<any>;
  @Input()
  public getType?: NodeGetTypeFunction<any>;
  @Input()
  public getStyle?: NodeGetStyleFunction<any>;
  @Input()
  public multiple                      = false;
  @Input()
  public hasDetails?: NodeHasDetailsFunction<any>;
  @ContentChild(TreeContentDirective, {static: true})
  public content?: TreeContentDirective;
  @Input()
  public hideLeafIcon                  = false;
  @Input()
  public id?: string;
  @Output()
  public details                       = new EventEmitter();
  @Input()
  public dividerOffset                 = '256px';
  public portal: TemplatePortal | null = null;
  @ViewChild('treeContainer', {static: true})
  public treeContainer!: ElementRef;

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
    return !!this.contentEditableMethod;
  }

  public get cacheId() {
    return [ 'rxap', 'tree', this.id ].join('/');
  }

  public getLevel = (node: Node<Data>) => node.depth;

  public isExpandable = (node: Node<Data>) => node.hasChildren;

  public hasChild = (_: number, nodeData: Node<Data>) => nodeData.hasChildren;

  public ngOnInit() {
    this.dataSource.searchForm = this.searchForm;
    this.dataSource.setTreeControl(this.treeControl);
    this.dataSource.setToDisplay(this.toDisplay);
    this.dataSource.setGetIcon(this.getIcon);
    this.dataSource.setHasDetails(this.hasDetails);
    this.dataSource.setGetStyle(this.getStyle);
    this.dataSource.setGetType(this.getType);
    this.multiple = this.dataSource.metadata.selectMultiple ?? this.multiple;

    if (this.dataSource.selected.hasValue()) {
      this.dataSource.selected.selected.forEach((node) =>
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
    this.dataSource.selected.changed
    .pipe(
      map(($event) => $event.source.selected),
      startWith(this.dataSource.selected.selected),
      tap((selected) => selected.forEach((node) => this.openDetails(node))),
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
        },
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
    this.renderer.setStyle(this.treeContainer.nativeElement, 'max-width', offset);
    this.renderer.setStyle(this.treeContainer.nativeElement, 'min-width', offset);
    this.renderer.setStyle(this.treeContainer.nativeElement, 'flex-basis', offset);
    localStorage.setItem(this.cacheId, offset);
  }
}
