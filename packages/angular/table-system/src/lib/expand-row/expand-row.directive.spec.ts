import { Component, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ExpandRowContainerComponent } from './expand-row-container/expand-row-container.component';
import { ExpandRowContentDirective } from './expand-row-container/expand-row-content.directive';
import { ExpandRowDirective } from './expand-row.directive';
import { ExpandRowService } from './expand-row.service';

interface Row {
  id: number;
}

@Component({
  template: `
    <table>
      <tr [rxapExpandRow]="first" class="first"><td>first</td></tr>
      <tr [rxapExpandRow]="second" class="second"><td>second</td></tr>
      <tr class="detail-row">
        <td [rxap-expand-row]="first">
          <ng-template rxapExpandRowContent let-r><span class="detail">detail {{ r.id }}</span></ng-template>
        </td>
      </tr>
    </table>
  `,
  imports: [ ExpandRowDirective, ExpandRowContainerComponent, ExpandRowContentDirective ],
  providers: [ ExpandRowService ],
})
class HostComponent {
  first: Row = { id: 1 };
  second: Row = { id: 2 };
}

describe('ExpandRowDirective', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ NoopAnimationsModule ] });
  });

  function setup() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const service = fixture.debugElement.injector.get(ExpandRowService<Row>);
    const directives = fixture.debugElement
      .queryAll((d) => d.injector.get(ExpandRowDirective, null) !== null && d.name === 'tr')
      .map((d) => d.injector.get(ExpandRowDirective<Row>));
    return { fixture, service, directives, host: fixture.componentInstance };
  }

  it('reports whether its own row is the expanded one via isExpanded', () => {
    const { service, directives, host } = setup();
    const [ first, second ] = directives;
    expect(first.isExpanded).toBe(false);
    expect(second.isExpanded).toBe(false);
    first.onClick();
    expect(service.expandedRow.value).toBe(host.first);
    expect(first.isExpanded).toBe(true);
    expect(second.isExpanded).toBe(false);
    second.onClick();
    expect(first.isExpanded).toBe(false);
    expect(second.isExpanded).toBe(true);
  });

  it('collapses the row when it is clicked twice', () => {
    const { service, directives } = setup();
    directives[0].onClick();
    directives[0].onClick();
    expect(service.expandedRow.value).toBeNull();
    expect(directives[0].isExpanded).toBe(false);
  });

  it('keeps the rendered detail portal after the row was collapsed again', async () => {
    const { fixture, service, host } = setup();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.detail')).toBeNull();
    service.toggleRow(host.first);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(el.querySelector('.detail')?.textContent).toBe('detail 1');
    // the portal is memoized by the container, collapsing only animates the height
    service.toggleRow(host.first);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(el.querySelector('.detail')?.textContent).toBe('detail 1');
  });
});

describe('ExpandRowContentDirective', () => {

  it('ngTemplateContextGuard always narrows the context', () => {
    expect(ExpandRowContentDirective.ngTemplateContextGuard({} as ExpandRowContentDirective<Row>, { $implicit: { id: 1 } })).toBe(true);
    expect(ExpandRowContentDirective.ngTemplateContextGuard({} as ExpandRowContentDirective<Row>, null)).toBe(true);
  });

  it('exposes the projected template', () => {
    @Component({
      template: `<ng-template rxapExpandRowContent let-r><b>{{ r.id }}</b></ng-template>`,
      imports: [ ExpandRowContentDirective ],
    })
    class TemplateHost {
      readonly content = viewChild.required(ExpandRowContentDirective);
    }

    const fixture = TestBed.createComponent(TemplateHost);
    fixture.detectChanges();
    const template = fixture.componentInstance.content().template;
    const view = template.createEmbeddedView({ $implicit: { id: 5 } });
    view.detectChanges();
    expect(view.rootNodes[0].textContent).toBe('5');
    view.destroy();
  });
});
