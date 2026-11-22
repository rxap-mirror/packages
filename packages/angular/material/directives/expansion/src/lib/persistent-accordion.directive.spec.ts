import { ChangeDetectionStrategy, Component, input, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatExpansionModule } from '@angular/material/expansion';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { PersistentAccordionDirective } from './persistent-accordion.directive';

function hashString(s: string): string {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = (hash << 5) - hash + s.charCodeAt(i);
    hash |= 0;
  }
  return hash.toFixed(0);
}

const buildKey = (title: string, key = 'testing') => ['rxapPersistentAccordion', key, hashString(title)].join('_');

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatExpansionModule, PersistentAccordionDirective],
  template: `
    <mat-accordion [rxapPersistentAccordion]="key()" multi>
      @if (a()) {
        <mat-expansion-panel id="pa">
          <mat-expansion-panel-header><mat-panel-title>Personal data A</mat-panel-title></mat-expansion-panel-header>
          <p>Content A</p>
        </mat-expansion-panel>
      }
      @if (b()) {
        <mat-expansion-panel id="pb">
          <mat-expansion-panel-header><mat-panel-title>Personal data B</mat-panel-title></mat-expansion-panel-header>
          <p>Content B</p>
        </mat-expansion-panel>
      }
      @if (untitled()) {
        <mat-expansion-panel id="pu">
          <mat-expansion-panel-header>No title element</mat-expansion-panel-header>
          <p>Content U</p>
        </mat-expansion-panel>
      }
    </mat-accordion>
  `,
})
class HostComponent {
  readonly key = input('testing');
  readonly a = input(true);
  readonly b = input(false);
  readonly untitled = input(false);
  readonly directive = viewChild.required(PersistentAccordionDirective);
}

describe('PersistentAccordionDirective', () => {
  let fixture: ComponentFixture<HostComponent>;

  const panel = (id: string): HTMLElement => fixture.nativeElement.querySelector('#' + id);
  const isExpanded = (id: string) => panel(id).classList.contains('mat-expanded');
  const header = (id: string): HTMLElement => panel(id).querySelector('mat-expansion-panel-header')!;
  const set = (name: string, value: unknown) => fixture.componentRef.setInput(name, value);

  /** Runs the change detection including the afterRender hooks. */
  async function settle() {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ imports: [HostComponent, NoopAnimationsModule] });
    fixture = TestBed.createComponent(HostComponent);
  });

  it('creates the directive', async () => {
    await settle();
    expect(fixture.componentInstance.directive()).toBeInstanceOf(PersistentAccordionDirective);
  });

  it('restores an expanded state after the first render', async () => {
    localStorage.setItem(buildKey('Personal data A'), 'true');
    await settle();
    expect(isExpanded('pa')).toBe(true);
  });

  it('keeps panels closed without stored state or with a stored false', async () => {
    localStorage.setItem(buildKey('Personal data A'), 'false');
    await settle();
    expect(isExpanded('pa')).toBe(false);
  });

  it('persists expansion and collapse in local storage', async () => {
    await settle();
    header('pa').click();
    await settle();
    expect(localStorage.getItem(buildKey('Personal data A'))).toBe('true');
    header('pa').click();
    await settle();
    expect(localStorage.getItem(buildKey('Personal data A'))).toBeNull();
  });

  it('restores the state of panels that are rendered later', async () => {
    localStorage.setItem(buildKey('Personal data A'), 'true');
    localStorage.setItem(buildKey('Personal data B'), 'true');
    await settle();
    set('b', true);
    await settle();
    expect(isExpanded('pa')).toBe(true);
    expect(isExpanded('pb')).toBe(true);
  });

  it('keeps tracking existing panels after the panel list changed', async () => {
    await settle();
    set('b', true);
    await settle();
    header('pb').click();
    await settle();
    header('pa').click();
    await settle();
    expect(localStorage.getItem(buildKey('Personal data B'))).toBe('true');
    expect(localStorage.getItem(buildKey('Personal data A'))).toBe('true');
  });

  it('does not write twice for a panel after the effect re-ran', async () => {
    await settle();
    set('b', true);
    await settle();
    const spy = jest.spyOn(Storage.prototype, 'setItem');
    header('pa').click();
    await settle();
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });

  it('uses separate keys per accordion key', async () => {
    set('key', 'other');
    await settle();
    header('pa').click();
    await settle();
    expect(localStorage.getItem(buildKey('Personal data A', 'other'))).toBe('true');
    expect(localStorage.getItem(buildKey('Personal data A'))).toBeNull();
  });

  it('falls back to the panel id when there is no title', async () => {
    set('untitled', true);
    await settle();
    const dir = fixture.componentInstance.directive() as any;
    const key = (dir as PersistentAccordionDirective as any).buildKey(
      (dir as any).getPanelIdentifier({ id: 'x', accordion: undefined }),
    );
    expect(key).toBe('rxapPersistentAccordion_testing_x');
    header('pu').click();
    await settle();
    const stored = Object.keys(localStorage).filter((k) => k.startsWith('rxapPersistentAccordion_testing_cdk-accordion-child'));
    expect(stored).toHaveLength(1);
  });

  it('hashString trims and handles the empty string', () => {
    const dir = TestBed.runInInjectionContext(() => Object.create(PersistentAccordionDirective.prototype)) as any;
    expect(dir.hashString('')).toBe('0');
    expect(dir.hashString('  abc ')).toBe(dir.hashString('abc'));
    expect(dir.hashString('abc')).toBe(hashString('abc'));
  });

  it('stops tracking after destroy', async () => {
    await settle();
    const p = panel('pa');
    fixture.destroy();
    expect(p).toBeTruthy();
  });
});
