import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import { MatTabsModule } from '@angular/material/tabs';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
  EphemeralStorageService,
  LocalStorageService,
} from '@rxap/ngx-memory';
import { PersistentTabGroupDirective } from './persistent-tab-group.directive';

describe('@rxap/directives/material/expansion', () => {

  describe('PersistentTabGroupDirective', () => {

    describe('Component', () => {

      let componentFixture: ComponentFixture<TestComponent>;
      let localStorage: LocalStorageService;
      let directive: PersistentTabGroupDirective;

      @Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
          <mat-tab-group rxapPersistentTabGroup="name">
            <mat-tab label="1"></mat-tab>
            <mat-tab label="1"></mat-tab>
            <mat-tab label="1"></mat-tab>
          </mat-tab-group>`,
    imports: [
        MatTabsModule,
        PersistentTabGroupDirective,
    ]
})
      class TestComponent {}

      beforeEach(async () => {

        await TestBed.configureTestingModule({
          imports: [
            TestComponent,
            NoopAnimationsModule,
          ],
          providers: [ LocalStorageService ],
        }).overrideProvider(LocalStorageService, { useValue: new EphemeralStorageService() }).compileComponents();

        componentFixture = TestBed.createComponent(TestComponent);
        localStorage = TestBed.inject(LocalStorageService);

        const directiveEl = componentFixture.debugElement.query(By.directive(PersistentTabGroupDirective));

        expect(directiveEl).not.toBeNull();

        directive = directiveEl.injector.get(PersistentTabGroupDirective);
        expect(directive).toBeInstanceOf(PersistentTabGroupDirective);

        componentFixture.detectChanges();

      });

      it('should set selecte index to local storage index', () => {

        localStorage.set(directive.key, '1');
        expect(localStorage.get(directive.key)).toEqual('1');

        expect(directive.tabGroup.selectedIndex).toEqual(0);
        expect(directive.selectedIndex).toEqual(1);

        directive.ngOnInit();

        // zoneless: TestComponent is OnPush and nothing dirtied its view, so mark it explicitly
        // (in a real app the directive runs ngOnInit during the parent's change detection)
        componentFixture.debugElement.injector.get(ChangeDetectorRef).markForCheck();
        componentFixture.detectChanges();

        expect(directive.tabGroup.selectedIndex).toEqual(1);

      });

      it('should store expansion state to local storage', async () => {

        const tabLabels = componentFixture.debugElement.query(By.css('.mat-mdc-tab-labels'));

        expect(tabLabels).not.toBeNull();
        expect(tabLabels.children.length).toEqual(3);

        const tabElement0 = tabLabels.children[0];
        const tabElement1 = tabLabels.children[1];
        const tabElement2 = tabLabels.children[2];

        expect(tabElement0).not.toBeNull();
        expect(tabElement1).not.toBeNull();
        expect(tabElement2).not.toBeNull();

        expect(localStorage.get(directive.key)).toBeNull();
        tabElement1.nativeElement.click();
        componentFixture.detectChanges();
        await componentFixture.whenStable();
        expect(directive.tabGroup.selectedIndex).toEqual(1);
        expect(localStorage.get(directive.key)).toEqual('1');
        tabElement2.nativeElement.click();
        componentFixture.detectChanges();
        await componentFixture.whenStable();
        expect(localStorage.get(directive.key)).toEqual('2');
        tabElement0.nativeElement.click();
        componentFixture.detectChanges();
        await componentFixture.whenStable();
        expect(localStorage.get(directive.key)).toEqual('0');

      });

    });

  });

});
