import { Component, signal, TemplateRef, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RXAP_DATA_SOURCE_METADATA } from '@rxap/data-source';
import { TreeContentDirective } from './tree-content.directive';
import { TreeComponent } from './tree.component';
import {
  RXAP_TREE_DATA_SOURCE_CHILDREN_REMOTE_METHOD,
  RXAP_TREE_DATA_SOURCE_ROOT_REMOTE_METHOD,
  TreeDataSource,
} from './tree.data-source';

const data = () => [
  {
    id: 'a',
    name: 'Alpha',
    hasChildren: true,
    children: [{ id: 'a1', name: 'Apple', hasChildren: false, children: [] }],
  },
  { id: 'c', name: 'Gamma', hasChildren: false, children: [] },
];

@Component({
  imports: [TreeComponent, TreeContentDirective],
  template: `
    <rxap-tree
      id="t"
      [dataSource]="dataSource"
      [toDisplay]="toDisplay"
      [multiple]="multiple()"
      [hideLeafIcon]="true"
      [contentEditableMethod]="editable"
      (details)="details.push($event)"
    >
      <ng-template rxapTreeContent let-item>detail:{{ item.name }}</ng-template>
    </rxap-tree>
  `,
})
class HostComponent {
  dataSource!: TreeDataSource;
  readonly multiple = signal(false);
  readonly toDisplay = (item: any) => item.name;
  readonly editable: any = { call: jest.fn() };
  readonly details: unknown[] = [];
  readonly tree = viewChild.required(TreeComponent);
}

describe('TreeComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let ds: TreeDataSource;

  async function create(extraProviders: any[] = []) {
    TestBed.configureTestingModule({
      imports: [HostComponent, NoopAnimationsModule],
      providers: [
        TreeDataSource,
        { provide: RXAP_TREE_DATA_SOURCE_ROOT_REMOTE_METHOD, useValue: { call: async () => data() } },
        { provide: RXAP_TREE_DATA_SOURCE_CHILDREN_REMOTE_METHOD, useValue: { call: async () => [] } },
        { provide: RXAP_DATA_SOURCE_METADATA, useValue: { id: 'tree-component' } },
        ...extraProviders,
      ],
    });
    ds = TestBed.inject(TreeDataSource);
    ds.ngOnInit();
    fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.dataSource = ds;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture.componentInstance.tree();
  }

  beforeEach(() => {
    localStorage.clear();
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
  });
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('renders nodes of the data source', async () => {
    await create();
    expect(fixture.nativeElement.textContent).toContain('Alpha');
    expect(fixture.nativeElement.textContent).toContain('Gamma');
  });

  it('level and expandable helpers', async () => {
    const tree = await create();
    const node = ds.tree$.value[0];
    expect(tree.getLevel(node)).toBe(0);
    expect(tree.isExpandable(node)).toBe(true);
    expect(tree.hasChild(0, node)).toBe(true);
    expect(tree.cacheId).toBe('rxap/tree/t');
  });

  it('forwards callbacks to the data source', async () => {
    await create();
    expect(ds.toDisplay({ name: 'x' } as any)).toBe('x');
    expect(ds.searchForm).toBeNull();
  });

  it('toggles the tree navigation', async () => {
    const tree = await create();
    expect(tree.showTreeNavigation()).toBe(true);
    tree.toggleTreeNavigation();
    fixture.detectChanges();
    expect(tree.showTreeNavigation()).toBe(false);
    expect(fixture.nativeElement.textContent).toContain('Show tree navigation');
  });

  it('opens details with the projected content when a node is selected', async () => {
    const tree = await create();
    jest.useFakeTimers();
    const node = ds.tree$.value[1];
    await ds.selectNode(node);
    node.select();
    jest.advanceTimersByTime(150);
    jest.useRealTimers();
    fixture.detectChanges();
    expect(fixture.componentInstance.details).toContainEqual(node.item);
    expect(tree.portal()).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('detail:Gamma');
  });

  it('delegates content editable changes', async () => {
    const tree = await create();
    const node = ds.tree$.value[0];
    tree.onContentEditableChange('new', node);
    expect(fixture.componentInstance.editable.call).toHaveBeenCalledWith('new', node.item, node);
    expect(tree.nodeDisplayEditable).toBe(true);
  });

  it('resizes the divider with the mouse and persists the offset', async () => {
    const tree = await create();
    const host = fixture.nativeElement.querySelector('rxap-tree') as HTMLElement;
    jest.spyOn(host, 'getBoundingClientRect').mockReturnValue({ left: 0, right: 1000 } as DOMRect);
    // no move without mouse down
    tree.onMousemove({ clientX: 400 } as MouseEvent);
    expect(tree.dividerOffset()).toBe('256px');
    tree.onMousedown();
    tree.onMousemove({ clientX: 400 } as MouseEvent);
    expect(tree.dividerOffset()).toBe('388px');
    expect(localStorage.getItem('rxap/tree/t')).toBe('388px');
    tree.onMousemove({ clientX: 10 } as MouseEvent);
    expect(tree.dividerOffset()).toBe('128px');
    tree.onMousemove({ clientX: 5000 } as MouseEvent);
    expect(tree.dividerOffset()).toBe('872px');
    tree.onMouseup();
    tree.onMousemove({ clientX: 300 } as MouseEvent);
    expect(tree.dividerOffset()).toBe('872px');
  });

  it('restores a cached divider offset', async () => {
    localStorage.setItem('rxap/tree/t', '321px');
    const tree = await create();
    fixture.detectChanges();
    expect(tree.dividerOffset()).toBe('321px');
  });

  it('ignores an invalid cached divider offset', async () => {
    localStorage.setItem('rxap/tree/t', 'abc');
    const tree = await create();
    expect(tree.dividerOffset()).toBe('256px');
  });

  it('uses selectMultiple of the data source metadata', async () => {
    const tree = await create();
    expect(tree.multiple()).toBe(false);
    fixture.componentInstance.multiple.set(true);
    fixture.detectChanges();
    expect(tree.multiple()).toBe(true);
  });
});
