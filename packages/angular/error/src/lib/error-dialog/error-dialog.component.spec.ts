import {
  Component,
  inject,
  signal,
} from '@angular/core';
import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {
  RXAP_ERROR_DIALOG_COMPONENT,
  RXAP_ERROR_DIALOG_DATA,
  RXAP_ERROR_DIALOG_ERROR,
} from '../tokens';
import { ErrorDialogComponent } from './error-dialog.component';

@Component({ selector: 'rxap-inner', template: '<span class="inner">{{ error.n }}</span>' })
class InnerComponent {
  error = inject(RXAP_ERROR_DIALOG_ERROR);
}

describe('ErrorDialogComponent', () => {
  let fixture: ComponentFixture<ErrorDialogComponent>;
  const data = signal<any[]>([{ n: 0 }]);

  beforeEach(() => {
    HTMLDialogElement.prototype.showModal = vi.fn();
    HTMLDialogElement.prototype.close = vi.fn();
    data.set([{ n: 0 }]);
    TestBed.configureTestingModule({
      providers: [
        { provide: RXAP_ERROR_DIALOG_DATA, useValue: data },
        { provide: RXAP_ERROR_DIALOG_COMPONENT, useValue: InnerComponent },
      ],
    });
    fixture = TestBed.createComponent(ErrorDialogComponent);
    fixture.detectChanges();
  });

  const text = () => fixture.nativeElement.querySelector('.inner')?.textContent;

  it('shows the active error without navigation for a single error', () => {
    expect(text()).toBe('0');
    expect(fixture.nativeElement.querySelector('.controls')).toBeNull();
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
  });

  it('computes displayed buttons around the active index', () => {
    data.set(Array.from({ length: 10 }, (_, n) => ({ n })));
    fixture.componentInstance.activeIndex.set(5);
    expect(fixture.componentInstance.displayedButtons()).toEqual([3, 4, 5, 6, 7]);
    fixture.componentInstance.activeIndex.set(0);
    expect(fixture.componentInstance.displayedButtons()).toEqual([0, 1, 2, 3, 4]);
  });

  it('navigates with previous, next and numbered buttons', () => {
    data.set([{ n: 0 }, { n: 1 }, { n: 2 }]);
    fixture.detectChanges();
    const buttons = () => Array.from<HTMLButtonElement>(fixture.nativeElement.querySelectorAll('.controls button'));
    expect(buttons().map((b) => b.textContent!.trim())).toEqual(['1', '2', '3', 'Next']);
    buttons().find((b) => b.textContent!.trim() === 'Next')!.click();
    fixture.detectChanges();
    expect(text()).toBe('1');
    buttons().find((b) => b.textContent!.trim() === 'Previous')!.click();
    fixture.detectChanges();
    expect(text()).toBe('0');
    buttons().find((b) => b.textContent!.trim() === '3')!.click();
    fixture.detectChanges();
    expect(text()).toBe('2');
  });

  it('closes the dialog and emits', () => {
    const spy = vi.fn();
    fixture.componentInstance.closeDialog.subscribe(spy);
    fixture.nativeElement.querySelector('dialog > button').click();
    expect(HTMLDialogElement.prototype.close).toHaveBeenCalled();
    expect(spy).toHaveBeenCalled();
  });
});
