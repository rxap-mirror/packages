import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatDatepickerIntl } from '@angular/material/datepicker';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { MatStepperIntl } from '@angular/material/stepper';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { LanguageSelectorService } from '@rxap/ngx-localize';
import {
  I18N_MAT_DATEPICKER_INTL_PROVIDER,
  I18nMatDatepickerIntl,
  ProvideI18nMatDatepickerIntl,
} from './datepicker';
import { LanguageSelectorMenuItemComponent } from './language-selector-menu-item/language-selector-menu-item.component';
import { LanguageSelectorComponent } from './language-selector/language-selector.component';
import {
  I18N_MAT_PAGINATOR_INTL_PROVIDER,
  I18nMatPaginatorIntl,
  ProvideI18nMatPaginatorIntl,
} from './paginator';
import { ProvideI18nMatIntl } from './provide';
import {
  I18N_MAT_STEPPER_INTL_PROVIDER,
  I18nMatStepperIntl,
  ProvideI18nMatStepperIntl,
} from './stepper';

beforeAll(() => {
  // join the template parts so the labels are real strings
  ((globalThis as any).$localize as jest.Mock).mockImplementation(
    (strings: TemplateStringsArray, ...values: any[]) => {
      const parts = [...strings];
      // strip the ":@@id:" metadata prefix of the first part
      parts[0] = parts[0].replace(/^:[^:]*:/, '');
      return parts.reduce((acc, part, i) => acc + part + (i < values.length ? values[i] : ''), '');
    },
  );
});

describe('I18nMatDatepickerIntl', () => {
  it('provides translated labels', () => {
    const intl = new I18nMatDatepickerIntl();
    expect(intl.calendarLabel).toBe('Calendar');
    expect(intl.openCalendarLabel).toBe('Open calendar');
    expect(intl.nextMonthLabel).toBe('Next month');
    expect(intl.endDateLabel).toBe('End date');
    expect(intl.formatYearRange('2000', '2023')).toBe('2000 – 2023');
    expect(intl.formatYearRangeLabel('2000', '2023')).toBe('2000 to 2023');
    expect(intl.changes).toBeDefined();
  });
  it('is registered as MatDatepickerIntl provider', () => {
    expect(I18N_MAT_DATEPICKER_INTL_PROVIDER).toEqual({ provide: MatDatepickerIntl, useClass: I18nMatDatepickerIntl });
    expect(ProvideI18nMatDatepickerIntl()).toBe(I18N_MAT_DATEPICKER_INTL_PROVIDER);
  });
});

describe('I18nMatStepperIntl', () => {
  it('provides translated labels', () => {
    const intl = new I18nMatStepperIntl();
    expect(intl.optionalLabel).toBe('Optional');
    expect(intl.completedLabel).toBe('Completed');
    expect(intl.editableLabel).toBe('Editable');
  });
  it('is registered as MatStepperIntl provider', () => {
    expect(I18N_MAT_STEPPER_INTL_PROVIDER).toEqual({ provide: MatStepperIntl, useClass: I18nMatStepperIntl });
    expect(ProvideI18nMatStepperIntl()).toBe(I18N_MAT_STEPPER_INTL_PROVIDER);
  });
});

describe('I18nMatPaginatorIntl', () => {
  let intl: I18nMatPaginatorIntl;
  beforeEach(() => (intl = new I18nMatPaginatorIntl()));
  it('provides translated labels', () => {
    expect(intl.itemsPerPageLabel).toBe('Items per page');
    expect(intl.nextPageLabel).toBe('Next page');
    expect(intl.previousPageLabel).toBe('Previous page');
    expect(intl.firstPageLabel).toBe('First page');
    expect(intl.lastPageLabel).toBe('Last page');
  });
  it('formats the range label', () => {
    expect(intl.getRangeLabel(0, 10, 0)).toBe('0 of 0');
    expect(intl.getRangeLabel(0, 0, 5)).toBe('0 of 5');
    expect(intl.getRangeLabel(0, 10, 25)).toBe('1 – 10 of 25');
    expect(intl.getRangeLabel(2, 10, 25)).toBe('21 – 25 of 25');
    expect(intl.getRangeLabel(5, 10, 25)).toBe('51 – 60 of 25');
  });
  it('is registered as MatPaginatorIntl provider', () => {
    expect(I18N_MAT_PAGINATOR_INTL_PROVIDER).toEqual({ provide: MatPaginatorIntl, useClass: I18nMatPaginatorIntl });
    expect(ProvideI18nMatPaginatorIntl()).toBe(I18N_MAT_PAGINATOR_INTL_PROVIDER);
  });
});

describe('ProvideI18nMatIntl', () => {
  it('returns all providers', () => {
    expect(ProvideI18nMatIntl()).toEqual([
      I18N_MAT_DATEPICKER_INTL_PROVIDER,
      I18N_MAT_PAGINATOR_INTL_PROVIDER,
      I18N_MAT_STEPPER_INTL_PROVIDER,
    ]);
  });
});

describe('LanguageSelectorComponent', () => {
  const hasLanguages = signal(true);
  const languages = signal<Record<string, string>>({ en: 'English', de: 'Deutsch' });
  const selectedLanguage = signal('en');
  const service = {
    hasLanguages,
    languages,
    selectedLanguage,
    setLanguage: jest.fn().mockResolvedValue(undefined),
  };

  @Component({
    template: `<rxap-language-selector [autoReload]="auto"></rxap-language-selector>`,
    imports: [LanguageSelectorComponent],
  })
  class HostComponent {
    auto = false;
  }

  beforeEach(() => {
    service.setLanguage.mockClear();
    hasLanguages.set(true);
    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule],
      providers: [{ provide: LanguageSelectorService, useValue: service }],
    });
  });

  it('renders the select when languages are available', () => {
    const f = TestBed.createComponent(HostComponent);
    f.detectChanges();
    expect(f.nativeElement.querySelector('mat-select')).not.toBeNull();
  });

  it('renders a hint when no languages are available', () => {
    hasLanguages.set(false);
    const f = TestBed.createComponent(HostComponent);
    f.detectChanges();
    expect(f.nativeElement.querySelector('mat-select')).toBeNull();
    expect(f.nativeElement.textContent).toContain('No languages available');
  });

  it('forwards the selection with the autoReload input', () => {
    const f = TestBed.createComponent(HostComponent);
    f.detectChanges();
    const cmp = f.debugElement.children[0].componentInstance as LanguageSelectorComponent;
    expect(cmp.hasLanguages()).toBe(true);
    expect(cmp.languages()).toEqual({ en: 'English', de: 'Deutsch' });
    expect(cmp.selectedLanguage()).toBe('en');
    cmp.selectLanguage('de');
    expect(service.setLanguage).toHaveBeenCalledWith('de', false);
    f.componentInstance.auto = true;
    f.changeDetectorRef.markForCheck();
    f.detectChanges();
    cmp.selectLanguage('en');
    expect(service.setLanguage).toHaveBeenLastCalledWith('en', true);
  });

  it('renders the menu item wrapper', () => {
    const f = TestBed.createComponent(LanguageSelectorMenuItemComponent);
    f.detectChanges();
    expect(f.nativeElement.querySelector('rxap-language-selector')).not.toBeNull();
  });
});
