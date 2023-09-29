import { Component } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {
  MatExpansionModule,
  MatExpansionPanel,
} from '@angular/material/expansion';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
  EphemeralStorageService,
  LocalStorageService,
} from '@rxap/ngx-memory';
import { Subject } from 'rxjs';
import { PersistentExpansionPanelDirective } from './persistent-expansion-panel.directive';

describe('@rxap/directives/material/expansion', () => {

  describe('PersistentExpansionPanelDirective', () => {

    describe('Class', () => {

      let directive: PersistentExpansionPanelDirective;
      let panel: MatExpansionPanel;
      let expandedChange: Subject<boolean>;
      let localStorage: EphemeralStorageService;

      beforeAll(() => {
        localStorage = new EphemeralStorageService();
      });

      afterEach(() => {
        localStorage.clear();
        jest.resetAllMocks();
      });

      beforeEach(() => {

        expandedChange = new Subject<boolean>();

        panel = {
          open: jest.fn(),
          close: jest.fn(),
          expandedChange,
        } as any;

        directive = new PersistentExpansionPanelDirective(localStorage, panel);

        directive.id = 'id';
        directive.uuid = 'uuid';
        directive.group = 'group';

      });

      it('should build the key', () => {
        expect(directive.key)
          .toEqual([ PersistentExpansionPanelDirective.BASE_KEY, 'group', 'uuid', 'id', 'isExpanded' ].join('/'));
      });

      it('should set panel open if local storage item exists', () => {

        localStorage.set(directive.key, 'true');

        directive.ngOnInit();

        expect(panel.open).toBeCalled();
        expect(panel.close).not.toBeCalled();

      });

      it('isExpanded should return true if key exists', () => {

        expect(localStorage.has(directive.key)).toBeFalsy();
        expect(directive.isExpanded).toBeFalsy();

        localStorage.set(directive.key, 'true');
        expect(directive.isExpanded).toBeTruthy();

      });

      it('should set panel close if local storage item not exists', () => {

        directive.ngOnInit();

        expect(panel.open).not.toBeCalled();
        expect(panel.close).toBeCalled();

      });

      it('should store panel expansion to local storage', () => {

        directive.ngOnInit();

        expect(localStorage.has(directive.key)).toBeFalsy();

        expandedChange.next(true);
        expect(localStorage.has(directive.key)).toBeTruthy();

        expandedChange.next(true);
        expect(localStorage.has(directive.key)).toBeTruthy();

        expandedChange.next(false);
        expect(localStorage.has(directive.key)).toBeFalsy();

        expandedChange.next(false);
        expect(localStorage.has(directive.key)).toBeFalsy();

      });

    });

    describe('Component', () => {

      let componentFixture: ComponentFixture<TestComponent>;
      let localStorage: EphemeralStorageService;
      let directive: PersistentExpansionPanelDirective;

      @Component({
        template: `
            <mat-expansion-panel rxapPersistentExpansionPanel="name" group="group" id="id">
                <mat-expansion-panel-header></mat-expansion-panel-header>
            </mat-expansion-panel>`,
      })
      class TestComponent {
      }

      beforeEach(async () => {

        await TestBed.configureTestingModule({
          imports: [
            MatExpansionModule,
            NoopAnimationsModule,
            PersistentExpansionPanelDirective,
          ],
          declarations: [ TestComponent ],
          providers: [ LocalStorageService ],
        }).overrideProvider(LocalStorageService, { useValue: new EphemeralStorageService() }).compileComponents();

        componentFixture = TestBed.createComponent(TestComponent);
        localStorage = TestBed.inject(LocalStorageService);

        const directiveEl = componentFixture.debugElement.query(By.directive(PersistentExpansionPanelDirective));

        expect(directiveEl).not.toBeNull();

        directive = directiveEl.injector.get(PersistentExpansionPanelDirective);
        expect(directive).toBeInstanceOf(PersistentExpansionPanelDirective);

        componentFixture.detectChanges();

      });

      it('should expand panel if local storage item exists', () => {

        localStorage.set(directive.key, 'true');

        expect(directive.expansionPanel.expanded).toEqual(false);

        directive.ngOnInit();

        expect(directive.expansionPanel.expanded).toEqual(true);

      });

      it('should store expansion state to local storage', () => {

        const expansionPanelHeaderElement = componentFixture.debugElement.query(By.css('mat-expansion-panel-header'));
        expect(expansionPanelHeaderElement).not.toBeNull();
        expect(directive.expansionPanel.expanded).toEqual(false);
        expect(localStorage.has(directive.key)).toEqual(false);
        expansionPanelHeaderElement.nativeElement.click();
        expect(directive.expansionPanel.expanded).toEqual(true);
        expect(localStorage.has(directive.key)).toEqual(true);
        expansionPanelHeaderElement.nativeElement.click();
        expect(directive.expansionPanel.expanded).toEqual(false);
        expect(localStorage.has(directive.key)).toEqual(false);

      });

    });

  });

});
