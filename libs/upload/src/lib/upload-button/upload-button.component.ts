import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  forwardRef,
  ChangeDetectorRef,
  OnDestroy,
  Optional,
  Self,
  ElementRef
} from '@angular/core';
import { FileUploadMethod } from '../file-upload.method';
import {
  ControlValueAccessor,
  NgControl,
  NG_VALUE_ACCESSOR
} from '@angular/forms';
import { ConnectedPosition } from '@angular/cdk/overlay';
import { MatFormFieldControl } from '@angular/material/form-field';
import { Subject } from 'rxjs';

@Component({
  selector:        'rxap-upload-button',
  templateUrl:     './upload-button.component.html',
  styleUrls:       [ './upload-button.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host:            { class: 'rxap-upload-button' },
  providers:       [
    {
      provide:     NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UploadButtonComponent),
      multi:       true
    },
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

  onContainerClick(event: MouseEvent): void {

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

  setDescribedByIds(ids: string[]): void {
    this._elementRef
        .nativeElement
        .querySelector('button')
        ?.setAttribute('aria-describedby', ids.join(' '));
  }

  shouldLabelFloat: boolean = true;
  public stateChanges       = new Subject<void>();
  userAriaDescribedBy?: string | undefined;
  public value: File | null = null;

  constructor(
    public readonly fileUpload: FileUploadMethod,
    private readonly cdr: ChangeDetectorRef,
    private readonly _elementRef: ElementRef,
    @Optional() @Self() public ngControl: NgControl
  ) { }

  public ngOnDestroy() {
    this.stateChanges.complete();
  }

  public uploadComplete(file: File) {
    this.uploaded.emit(file);
    this.value = file;
    if (this.onChange) {
      this.onChange(file);
    }
    this.stateChanges.next();
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
    this.value = file;
  }

  public openOverlay() {
    if (this.value) {
      if (this.value.type.match(/^image\//)) {
        this.isOpen = true;
        this.cdr.detectChanges();
      }
    }
  }

  onFocusIn(event: FocusEvent) {
    if (!this.focused) {
      this.focused = true;
      this.stateChanges.next();
    }
  }

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

}
