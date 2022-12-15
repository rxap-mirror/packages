import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ChangeDetectorRef,
  OnDestroy,
  Optional,
  Self,
  ElementRef,
  HostListener,
  Inject,
  isDevMode
} from '@angular/core';
import { FileUploadMethod } from '../file-upload.method';
import {
  ControlValueAccessor,
  NgControl
} from '@angular/forms';
import { ConnectedPosition } from '@angular/cdk/overlay';
import { MatLegacyFormFieldControl as MatFormFieldControl } from '@angular/material/legacy-form-field';
import { Subject } from 'rxjs';
import { DOCUMENT } from '@angular/common';

@Component({
  selector:        'rxap-upload-button',
  templateUrl:     './upload-button.component.html',
  styleUrls:       [ './upload-button.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host:            { class: 'rxap-upload-button' },
  providers:       [
    {
      provide:     MatFormFieldControl,
      useExisting: UploadButtonComponent
    }
  ]
})
export class UploadButtonComponent implements ControlValueAccessor, MatFormFieldControl<File>, OnDestroy {

  static nextId = 0;

  @Input()
  public accept = '**/**';

  @Output()
  public uploaded = new EventEmitter<File>();

  get isImage(): boolean {
    return !!this.value?.type.match(/^image\//);
  }

  @Input()
  public disabled                       = false;
  public isOpen: boolean                = false;
  public positions: ConnectedPosition[] = [
    {
      originY:  'bottom',
      originX:  'start',
      overlayX: 'start',
      overlayY: 'top',
      offsetY:  12
    }
  ];
  private onChange?: (file: File) => any;
  private onTouched?: () => any;

  private _placeholder!: string;

  touched: boolean                 = false;
  autofilled?: boolean | undefined;
  controlType?: string | undefined = 'rxap-upload-button';

  public get empty(): boolean {
    return this.value === null;
  }

  errorState: boolean = false;
  focused: boolean    = false;

  public get id(): string {
    return `rxap-upload-button-${UploadButtonComponent.nextId++}`;
  }

  @Input()
  get placeholder() {
    return this._placeholder;
  }

  set placeholder(plh) {
    this._placeholder = plh;
    this.stateChanges.next();
  }

  @Input()
  public required: boolean = false;

  shouldLabelFloat: boolean = true;
  public stateChanges       = new Subject<void>();
  userAriaDescribedBy?: string | undefined;
  public value: File | null = null;

  constructor(
    public readonly fileUpload: FileUploadMethod,
    private readonly cdr: ChangeDetectorRef,
    private readonly _elementRef: ElementRef,
    @Inject(DOCUMENT)
    private readonly document: Document,
    @Optional() @Self() public ngControl: NgControl
  ) {
    if (this.ngControl != null) {
      this.ngControl.valueAccessor = this;
    }
  }

  public onContainerClick(event: MouseEvent): void {

  }

  public setDescribedByIds(ids: string[]): void {
    this._elementRef
        .nativeElement
        .querySelector('button')
        ?.setAttribute('aria-describedby', ids.join(' '));
  }

  public ngOnDestroy() {
    this.stateChanges.complete();
  }

  public uploadComplete(file: File | null) {
    if (file) {
      this.uploaded.emit(file);
      this.value = file;
      if (this.onChange) {
        this.onChange(file);
      }
      this.stateChanges.next();
    }
  }

  public registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  public setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
  }

  public writeValue(file: File): void {
    if (isDevMode()) {
      console.log({ file });
    }
    this.value = file;
    this.cdr.detectChanges();
  }

  public openOverlay() {
    if (this.value) {
      if (this.value.type.match(/^image\//)) {
        this.isOpen = true;
        this.cdr.detectChanges();
      }
    }
  }

  @HostListener('focusin', [ '$event' ])
  onFocusIn(event: FocusEvent) {
    if (!this.focused) {
      this.focused = true;
      this.stateChanges.next();
    }
  }

  @HostListener('focusout', [ '$event' ])
  onFocusOut(event: FocusEvent) {
    if (!this._elementRef.nativeElement.contains(event.relatedTarget as Element)) {
      this.touched = true;
      this.focused = false;
      if (this.onTouched) {
        this.onTouched();
      }
      this.stateChanges.next();
    }
  }

  download() {
    if (this.value) {
      const elm = this.document.createElement('a');
      this.document.body.appendChild(elm);
      elm.href = URL.createObjectURL(this.value);
      elm.setAttribute('download', this.value.name);
      elm.click();
      this.document.body.removeChild(elm);
    }
  }
}
