import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  MatExpansionModule,
} from '@angular/material/expansion';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { EphemeralStorageService, LocalStorageService } from '@rxap/ngx-memory';
import { PersistentExpansionPanelDirective } from './persistent-expansion-panel.directive';

describe('@rxap/directives/material/expansion', () => {
  describe('PersistentExpansionPanelDirective', () => {
    describe('Component', () => {
      let componentFixture: ComponentFixture<TestComponent>;
      let localStorage: EphemeralStorageService;
      let directive: PersistentExpansionPanelDirective;

      @Component({
        changeDetection: ChangeDetectionStrategy.OnPush,
        template: ` <mat-expansion-panel
          rxapPersistentExpansionPanel="name"
          group="group"
          uuid="uuid"
        >
          <mat-expansion-panel-header></mat-expansion-panel-header>
        </mat-expansion-panel>`,
        imports: [MatExpansionModule, PersistentExpansionPanelDirective],
      })
      class TestComponent {}

      beforeEach(async () => {
        await TestBed.configureTestingModule({
          imports: [
            TestComponent,
            NoopAnimationsModule,
          ],
          providers: [LocalStorageService],
        })
          .overrideProvider(LocalStorageService, {
            useValue: new EphemeralStorageService(),
          })
          .compileComponents();

        componentFixture = TestBed.createComponent(TestComponent);
        localStorage = TestBed.inject(LocalStorageService);

        const directiveEl = componentFixture.debugElement.query(
          By.directive(PersistentExpansionPanelDirective),
        );

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
        const expansionPanelHeaderElement = componentFixture.debugElement.query(
          By.css('mat-expansion-panel-header'),
        );
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
