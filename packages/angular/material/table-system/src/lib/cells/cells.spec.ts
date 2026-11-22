import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatOption } from '@angular/material/core';
import { By } from '@angular/platform-browser';
import { BooleanCellComponent } from './boolean-cell/boolean-cell.component';
import { CopyToClipboardCellComponent } from './copy-to-clipboard-cell/copy-to-clipboard-cell.component';
import { DateCellComponent } from './date-cell/date-cell.component';
import { IconCellComponent } from './icon-cell/icon-cell.component';
import { ImageCellComponent } from './image-cell/image-cell.component';
import { LinkCellComponent } from './link-cell/link-cell.component';
import { OptionsCellComponent } from './options-cell/options-cell.component';
import { TreeControlCellComponent } from './tree-control-cell/tree-control-cell.component';

@Component({
  standalone: true,
  // Angular 22 components are OnPush by default; the specs mutate the host state directly
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    BooleanCellComponent,
    CopyToClipboardCellComponent,
    DateCellComponent,
    IconCellComponent,
    ImageCellComponent,
    LinkCellComponent,
  ],
  template: `
    <table>
      <tr>
        <td id="bool" [rxap-boolean-cell]="bool">projected</td>
        <td id="copy" [rxap-copy-to-clipboard-cell]="copy"></td>
        <td id="date" [rxap-date-cell]="date" [format]="'yyyy'"></td>
        <td id="icon" [rxap-icon-cell]="icon"></td>
        <td id="image" [rxap-image-cell]="image" preset="p"></td>
        <td id="link" [rxap-link-cell]="link" [protocol]="protocol" [short]="short"></td>
      </tr>
    </table>
  `,
})
class HostComponent {
  bool: any = true;
  copy: any = 'text';
  date: any = new Date(2020, 5, 1);
  icon: any = { icon: 'home' };
  image: any = 'http://x/y.png';
  link: any = 'http://example.com';
  protocol: any = undefined;
  short = true;
}

describe('table cells', () => {
  let fixture: any;
  let host: HostComponent;
  const $ = (sel: string) => fixture.nativeElement.querySelector(sel);

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
  });

  it('boolean cell', () => {
    fixture.detectChanges();
    expect($('#bool .truthy')).toBeTruthy();
    expect($('#bool').textContent).toContain('projected');
    host.bool = 0;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    expect($('#bool .falsy')).toBeTruthy();
  });

  it('copy to clipboard cell hides for empty values', () => {
    fixture.detectChanges();
    expect($('#copy rxap-copy-to-clipboard')).toBeTruthy();
    host.copy = '';
    fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.copy = null;
    fixture.detectChanges();
    expect($('#copy rxap-copy-to-clipboard')).toBeNull();
  });

  it('date cell formats the date', () => {
    fixture.detectChanges();
    expect($('#date').textContent.trim()).toBe('2020');
    fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.date = null;
    fixture.detectChanges();
    expect($('#date').textContent.trim()).toBe('');
  });

  it('icon cell renders an icon only with a config', () => {
    fixture.detectChanges();
    expect($('#icon mat-icon')).toBeTruthy();
    fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.icon = null;
    fixture.detectChanges();
    expect($('#icon mat-icon')).toBeNull();
  });

  it('image cell renders an image only with a value', () => {
    fixture.detectChanges();
    expect($('#image .image')).toBeTruthy();
    expect($('#image .p')).toBeTruthy();
    fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.image = null;
    fixture.detectChanges();
    expect($('#image .image')).toBeNull();
  });

  it('link cell renders short links and builds hrefs', () => {
    fixture.detectChanges();
    expect($('#link a').getAttribute('href')).toBe('http://example.com');
    expect($('#link mat-icon').textContent).toBe('launch');
    expect($('#link .content').textContent).toBe('Open');
    const cell = fixture.debugElement.query(By.directive(LinkCellComponent)).componentInstance;
    expect(cell.href).toBe('http://example.com');
  });

  it.each([
    ['tel', 'call'],
    ['mailto', 'email'],
  ])('link cell with protocol %s', (protocol, icon) => {
    fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.protocol = protocol;
    fixture.componentInstance.link = 'abc';
    fixture.componentInstance.short = false;
    fixture.detectChanges();
    expect($('#link mat-icon').textContent).toBe(icon);
    expect($('#link a').getAttribute('href')).toBe(`${protocol}:abc`);
    expect($('#link .content').textContent).toBe('abc');
  });

  it('link cell renders nothing without value', () => {
    fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.link = '';
    fixture.detectChanges();
    expect($('#link a')).toBeNull();
  });
});

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [OptionsCellComponent, MatOption],
  template: `
    <table>
      <tr>
        <td [rxap-options-cell]="value" default="dflt" empty="none">
          <mat-option [value]="1">One</mat-option>
          <mat-option [value]="2">Two</mat-option>
        </td>
      </tr>
    </table>
  `,
})
class OptionsHostComponent {
  value: any = 2;
}

describe('OptionsCellComponent', () => {
  it('resolves the view value of the selected option', () => {
    TestBed.configureTestingModule({ imports: [OptionsHostComponent] });
    const fixture = TestBed.createComponent(OptionsHostComponent);
    fixture.detectChanges();
    const cell: OptionsCellComponent = fixture.debugElement.query(By.directive(OptionsCellComponent)).componentInstance;
    expect(cell.getViewValue()).toBe('Two');
    expect(fixture.nativeElement.querySelector('mat-option').style.display).toBe('none');
    fixture.componentInstance.value = 99;
    fixture.detectChanges();
    expect(cell.viewValue()).toBe('dflt');
    fixture.componentInstance.value = null;
    fixture.detectChanges();
    expect(cell.viewValue()).toBe('none');
  });
});

describe('TreeControlCellComponent', () => {
  function create(node: any, icon?: any) {
    @Component({
      standalone: true,
      imports: [TreeControlCellComponent],
      template: `<rxap-tree-control-cell [rxap-tree-control-cell]="element">content</rxap-tree-control-cell>`,
    })
    class Host {
      element: any = { __node: node, icon };
    }
    TestBed.configureTestingModule({ imports: [Host] });
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    return fixture;
  }

  it('shows the expand icons and toggles the node', () => {
    const node = { depth: 2, hasChildren: true, expanded: false, toggleExpand: jest.fn() };
    const fixture = create(node);
    const cell: TreeControlCellComponent = fixture.debugElement.query(By.directive(TreeControlCellComponent)).componentInstance;
    expect(cell.offset()).toBe('48px');
    expect(cell.expandIcon).toBe('expand_less');
    node.expanded = true;
    cell.ngDoCheck();
    expect(cell.expandIcon).toBe('expand_more');
    fixture.nativeElement.querySelector('button').click();
    expect(node.toggleExpand).toHaveBeenCalled();
  });

  it('falls back to the leaf icon without children', () => {
    const fixture = create({ depth: 0, hasChildren: false, expanded: false, toggleExpand: jest.fn() });
    const cell: TreeControlCellComponent = fixture.debugElement.query(By.directive(TreeControlCellComponent)).componentInstance;
    expect(cell.icon).toEqual({ icon: 'subdirectory_arrow_right' });
  });
});
