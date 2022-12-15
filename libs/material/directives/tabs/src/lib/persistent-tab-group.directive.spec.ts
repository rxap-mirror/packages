import { Subject } from 'rxjs';
import {
  LocalStorageServiceFake,
  LOCAL_STORAGE_SERVICE_FAKE_PROVIDER
} from '@rxap/services/testing';
import { Component } from '@angular/core';
import {
  TestBed,
  ComponentFixture,
  fakeAsync,
  tick
} from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import {
  MatLegacyTabGroup as MatTabGroup,
  MatLegacyTabsModule as MatTabsModule
} from '@angular/material/legacy-tabs';
import { PersistentTabGroupDirective } from './persistent-tab-group.directive';

describe('@rxap/directives/material/expansion', () => {

  describe('PersistentTabGroupDirective', () => {

    describe('Class', () => {

      let directive: PersistentTabGroupDirective;
      let group: MatTabGroup;
      let localStorage: LocalStorageServiceFake;
      let selectedIndexChange: Subject<number>;

      beforeAll(() => {
        localStorage = new LocalStorageServiceFake();
      });

      afterEach(() => {
        localStorage.localStorage.clear();
        jest.resetAllMocks();
      });

      beforeEach(() => {

        selectedIndexChange = new Subject<number>();

        group = {
          selectedIndex: null,
          selectedIndexChange
        } as any;

        directive = new PersistentTabGroupDirective(localStorage, group);

        directive.id   = 'id';
        directive.uuid = 'uuid';

      });

      it('should build the key', () => {
        expect(directive.key).toEqual([ PersistentTabGroupDirective.BASE_KEY, 'uuid', 'id', 'isExpanded' ].join('/'));
      });

      it('should set tab group index to 0 local storage item not exists', () => {

        directive.ngOnInit();

        expect(group.selectedIndex).toEqual(0);

      });

      it('selectedIndex should return 0 if local storage item not exists', () => {

        expect(localStorage.has(directive.key)).toBeFalsy();
        expect(directive.selectedIndex).toEqual(0);

      });

      it('should store tab group selected index local storage', () => {

        directive.ngOnInit();

        expect(localStorage.has(directive.key)).toBeFalsy();

        selectedIndexChange.next(0);
        expect(localStorage.get(directive.key)).toEqual('0');

        selectedIndexChange.next(1);
        expect(localStorage.get(directive.key)).toEqual('1');

        selectedIndexChange.next(2);
        expect(localStorage.get(directive.key)).toEqual('2');

        selectedIndexChange.next(3);
        expect(localStorage.get(directive.key)).toEqual('3');

      });

    });

    describe('Component', () => {

      let componentFixture: ComponentFixture<TestComponent>;
      let localStorage: LocalStorageServiceFake;
      let directive: PersistentTabGroupDirective;

      @Component({
        template: `
                    <mat-tab-group rxapPersistentTabGroup="name">
                      <mat-tab label="1"></mat-tab>
                      <mat-tab label="1"></mat-tab>
                      <mat-tab label="1"></mat-tab>
                    </mat-tab-group>`
      })
      class TestComponent {}

      beforeEach(async () => {

        await TestBed.configureTestingModule({
          imports:      [
            MatTabsModule,
            NoopAnimationsModule
          ],
          declarations: [ TestComponent, PersistentTabGroupDirective ],
          providers:    [ LOCAL_STORAGE_SERVICE_FAKE_PROVIDER ]
        }).compileComponents();

        componentFixture = TestBed.createComponent(TestComponent);
        localStorage     = TestBed.inject(LocalStorageServiceFake);

        const directiveEl = componentFixture.debugElement.query(By.directive(PersistentTabGroupDirective));

        expect(directiveEl).not.toBeNull();

        directive = directiveEl.injector.get(PersistentTabGroupDirective);
        expect(directive).toBeInstanceOf(PersistentTabGroupDirective);

        componentFixture.detectChanges();

      });

      it('should set selecte index to local storage index', () => {

        localStorage.set(directive.key, '1');

        expect(directive.tabGroup.selectedIndex).toEqual(0);
        expect(directive.selectedIndex).toEqual(1);

        directive.ngOnInit();

        componentFixture.detectChanges();

        expect(directive.tabGroup.selectedIndex).toEqual(1);

      });

      it('should store expansion state to local storage', fakeAsync(() => {

        const tabLabels = componentFixture.debugElement.query(By.css('.mat-tab-labels'));

        expect(tabLabels).not.toBeNull();
        expect(tabLabels.children.length).toEqual(3);

        const tabElement0 = tabLabels.children[ 0 ];
        const tabElement1 = tabLabels.children[ 1 ];
        const tabElement2 = tabLabels.children[ 2 ];

        expect(tabElement0).not.toBeNull();
        expect(tabElement1).not.toBeNull();
        expect(tabElement2).not.toBeNull();

        expect(localStorage.get(directive.key)).toBeNull();
        tabElement1.nativeElement.click();
        componentFixture.detectChanges();
        tick();
        expect(directive.tabGroup.selectedIndex).toEqual(1);
        expect(localStorage.get(directive.key)).toEqual('1');
        tabElement2.nativeElement.click();
        componentFixture.detectChanges();
        tick();
        expect(localStorage.get(directive.key)).toEqual('2');
        tabElement0.nativeElement.click();
        componentFixture.detectChanges();
        tick();
        expect(localStorage.get(directive.key)).toEqual('0');

      }));

    });

  });

});
