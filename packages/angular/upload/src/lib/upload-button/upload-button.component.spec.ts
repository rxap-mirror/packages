import { Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { UploadButtonComponent } from './upload-button.component';

@Component({
  standalone: true,
  imports: [UploadButtonComponent, ReactiveFormsModule],
  template: `
    <rxap-upload-button
      [formControl]="control"
      [accept]="accept()"
      [allowDownload]="allowDownload()"
      [placeholder]="placeholder()"
      [required]="required()"
      (uploaded)="uploaded.push($event)">Drop here</rxap-upload-button>
  `,
})
class HostComponent {
  control = new FormControl<File | null>(null);
  accept = signal<string | string[]>('**/**');
  allowDownload = signal(false);
  placeholder = signal('Pick');
  required = signal(false);
  uploaded: File[] = [];
  cmp = viewChild.required(UploadButtonComponent);
}

describe('UploadButtonComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let cmp: UploadButtonComponent;
  let snack: jest.SpyInstance;

  const el = () => fixture.nativeElement as HTMLElement;
  const input = () => el().querySelector('input[type=file]') as HTMLInputElement;
  const detect = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
  };
  const choose = (file?: File) => {
    Object.defineProperty(input(), 'files', { configurable: true, value: file ? { 0: file } : {} });
    input().dispatchEvent(new Event('change'));
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent, MatIconTestingModule, NoopAnimationsModule],
    }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    await detect();
    cmp = host.cmp();
    snack = jest.spyOn(cmp.snackBar, 'open').mockImplementation(() => undefined as any);
  });

  it('renders placeholder and projected content when empty', () => {
    expect(el().textContent).toContain('Pick');
    expect(el().textContent).toContain('Drop here');
    expect(cmp.empty).toBe(true);
    expect(cmp.id).toMatch(/^rxap-upload-button-\d+$/);
    expect(cmp.controlType).toBe('rxap-upload-button');
  });

  it('computes the accept attribute from a string or an array', async () => {
    expect(input().getAttribute('accept')).toBe('**/**');
    host.accept.set(['image/png', '.pdf']);
    await detect();
    expect(input().getAttribute('accept')).toBe('image/png,.pdf');
  });

  it('clicking the button opens the file dialog', () => {
    const spy = jest.spyOn(input(), 'click');
    (el().querySelector('button[mat-stroked-button]') as HTMLButtonElement).click();
    expect(spy).toHaveBeenCalled();
  });

  it('selecting a file updates control, emits and shows the name', async () => {
    const file = new File(['x'], 'doc.txt', { type: 'text/plain' });
    const stateChanges = jest.fn();
    cmp.stateChanges.subscribe(stateChanges);
    choose(file);
    await detect();
    expect(host.control.value).toBe(file);
    expect(host.uploaded).toEqual([file]);
    expect(cmp.value).toBe(file);
    expect(cmp.empty).toBe(false);
    expect(stateChanges).toHaveBeenCalled();
    expect(el().textContent).toContain('doc.txt');
    expect(el().textContent).not.toContain('Pick');
  });

  it('shows a snack bar when no file is selected', () => {
    choose();
    expect(snack).toHaveBeenCalledWith('No file selected', 'close', { duration: 3000 });
    expect(host.uploaded).toEqual([]);
  });

  it('onFileInputChange tolerates a missing event', () => {
    cmp.onFileInputChange(undefined);
    expect(snack).toHaveBeenCalled();
  });

  it('writeValue sets the value and clear resets it', async () => {
    const file = new File(['x'], 'a.txt');
    host.control.setValue(file);
    await detect();
    expect(cmp.value).toBe(file);
    cmp.clear();
    expect(cmp.empty).toBe(true);
  });

  it('disables the button via the form control', async () => {
    host.control.disable();
    await detect();
    expect(cmp.disabled).toBe(true);
    expect((el().querySelector('button[mat-stroked-button]') as HTMLButtonElement).disabled).toBe(true);
    host.control.enable();
    await detect();
    expect(cmp.disabled).toBe(false);
  });

  it('reflects the required and placeholder inputs', async () => {
    host.required.set(true);
    await detect();
    expect(cmp.required).toBe(true);
    expect(cmp.placeholder).toBe('Pick');
  });

  it('notifies state changes when signal state changes', async () => {
    const spy = jest.fn();
    cmp.stateChanges.subscribe(spy);
    host.placeholder.set('Other');
    await detect();
    expect(spy).toHaveBeenCalled();
  });

  it('tracks focus and marks the control touched when focus leaves', async () => {
    const spy = jest.fn();
    cmp.stateChanges.subscribe(spy);
    const btn = el().querySelector('button[mat-stroked-button]') as HTMLButtonElement;
    btn.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    expect(cmp.focused).toBe(true);
    btn.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    btn.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: btn }));
    expect(cmp.focused).toBe(true);
    btn.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: null }));
    await detect();
    expect(cmp.focused).toBe(false);
    expect(cmp.touched).toBe(true);
    expect(host.control.touched).toBe(true);
  });

  it('focusout works without a registered touched callback', () => {
    (cmp as any).onTouched = undefined;
    cmp.onFocusOut({ relatedTarget: null } as any);
    expect(cmp.touched).toBe(true);
  });

  it('sets aria-describedby on the button', () => {
    cmp.setDescribedByIds(['a', 'b']);
    expect(el().querySelector('button')!.getAttribute('aria-describedby')).toBe('a b');
  });

  it('onContainerClick is a noop', () => {
    expect(() => cmp.onContainerClick(new MouseEvent('click'))).not.toThrow();
  });

  it('completes stateChanges on destroy', () => {
    const complete = jest.fn();
    cmp.stateChanges.subscribe({ complete });
    fixture.destroy();
    expect(complete).toHaveBeenCalled();
  });

  describe('download', () => {
    it('is only offered when allowed and a value exists', async () => {
      const count = () => fixture.debugElement.queryAll(By.css('button[matTooltip="Download file"]')).length;
      host.allowDownload.set(true);
      await detect();
      expect(count()).toBe(0);
      host.control.setValue(new File(['x'], 'a.txt'));
      await detect();
      expect(count()).toBe(1);
    });

    it('creates a temporary link and clicks it', async () => {
      const file = new File(['x'], 'a.txt');
      (URL as any).createObjectURL = jest.fn(() => 'blob:abc');
      const click = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
      host.allowDownload.set(true);
      host.control.setValue(file);
      await detect();
      const btn = fixture.debugElement.query(By.css('button[matTooltip="Download file"]'));
      btn.nativeElement.click();
      expect(URL.createObjectURL).toHaveBeenCalledWith(file);
      expect(click).toHaveBeenCalled();
      expect(document.body.querySelector('a[download]')).toBeNull();
      click.mockRestore();
    });

    it('does nothing without a value', () => {
      (URL as any).createObjectURL = jest.fn();
      cmp.download();
      expect(URL.createObjectURL).not.toHaveBeenCalled();
    });
  });

  describe('image preview', () => {
    it('is offered for image files and opens the overlay', async () => {
      const file = new File(['x'], 'a.png', { type: 'image/png' });
      host.control.setValue(file);
      await detect();
      expect(cmp.isImage).toBe(true);
      const btn = fixture.debugElement.query(By.css('button[matTooltip="Open image preview"]'));
      expect(btn).toBeTruthy();
      btn.nativeElement.click();
      expect(cmp.isImageUploaded()).toBe(true);
      await detect();
      expect(document.querySelector('.overlay-container img')).toBeTruthy();
      cmp.isImageUploaded.set(false);
    });

    it('does not open the overlay for non images', () => {
      host.control.setValue(new File(['x'], 'a.txt', { type: 'text/plain' }));
      cmp.openOverlay();
      expect(cmp.isImageUploaded()).toBe(false);
      expect(cmp.isImage).toBe(false);
    });
  });
});

describe('UploadButtonComponent standalone', () => {
  it('works without a form control', async () => {
    await TestBed.configureTestingModule({
      imports: [UploadButtonComponent, MatIconTestingModule, NoopAnimationsModule],
    }).compileComponents();
    const fixture = TestBed.createComponent(UploadButtonComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.ngControl).toBeNull();
    const file = new File(['x'], 'a.txt');
    fixture.componentInstance.onFileInputChange({ target: { files: { 0: file } } });
    expect(fixture.componentInstance.value).toBe(file);
  });
});
