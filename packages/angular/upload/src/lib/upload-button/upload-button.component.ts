import {
  CdkConnectedOverlay,
  CdkOverlayOrigin,
  ConnectedPosition,
} from '@angular/cdk/overlay';
import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DOCUMENT,
  effect,
  ElementRef,
  inject,
  input,
  linkedSignal,
  OnDestroy,
  output,
  signal,
  untracked,
} from '@angular/core';
import {
  ControlValueAccessor,
  NgControl,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldControl } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  MatSnackBar,
  MatSnackBarModule,
} from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MethodDirective } from '@rxap/directives';
import { coerceBoolean } from '@rxap/utilities';
import { Subject } from 'rxjs';
import { ReadAsDataURLPipe } from './read-as-data-url.pipe';
import { Showcase } from '@ng-prism/core';

@Showcase<UploadButtonComponent>({
  title: 'Upload Button',
  category: 'Forms',
  description: 'A button that opens the file picker. Can be used as a `MatFormFieldControl` inside a form field.',
  status: 'stable',
  variants: [
    { name: 'Default', content: 'Select file' },
    { name: 'Images only', inputs: { accept: 'image/*' }, content: 'Select image' },
  ],
})
@Component({
    selector: 'rxap-upload-button',
    templateUrl: './upload-button.component.html',
    styleUrls: ['./upload-button.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
  
    host: {
      class: 'rxap-upload-button',
      '(focusin)': 'onFocusIn($event)',
      '(focusout)': 'onFocusOut($event)',
    },
    providers: [
        {
            provide: MatFormFieldControl,
            useExisting: UploadButtonComponent,
        },
    ],
    imports: [
        MatButtonModule,
        CdkOverlayOrigin,
        MethodDirective,
        MatIconModule,
        MatProgressSpinnerModule,
        MatTooltipModule,
        CdkConnectedOverlay,
        AsyncPipe,
        ReadAsDataURLPipe,
        MatSnackBarModule,
    ]
})
export class UploadButtonComponent implements ControlValueAccessor, MatFormFieldControl<File>, OnDestroy {

  static nextId = 0;

  public accept = input<string | string[]>('**/**');

  readonly acceptAttribute = computed(() => {
    const accept = this.accept();
    return Array.isArray(accept) ? accept.join(',') : accept;
  });

  public allowDownload = input(false);

  public uploaded = output<File>();

  public isImageUploaded = signal(false);
  public positions: ConnectedPosition[] = [
    {
      originY: 'bottom',
      originX: 'start',
      overlayX: 'start',
      overlayY: 'top',
      offsetY: 12,
    },
  ];
  touched = false;

  // region MatFormFieldControl
  public readonly disabledInput = input(false, { alias: 'disabled', transform: coerceBoolean });
  private readonly _disabled = linkedSignal(() => this.disabledInput());
  public get disabled(): boolean {
    return this._disabled();
  }
  autofilled?: boolean | undefined;
  controlType?: string | undefined = 'rxap-upload-button';
  errorState = false;
  focused = false;
  public readonly requiredInput = input(false, { alias: 'required', transform: coerceBoolean });
  public get required(): boolean {
    return this.requiredInput();
  }
  shouldLabelFloat = true;
  public stateChanges = new Subject<void>();
  userAriaDescribedBy?: string | undefined;
  private readonly _value = signal<File | null>(null);
  public get value(): File | null {
    return this._value();
  }
  public readonly ngControl = inject(NgControl, {
    optional: true,
    self: true,
  });
  public readonly placeholderInput = input('', { alias: 'placeholder' });
  public get placeholder(): string {
    return this.placeholderInput();
  }
  public get empty(): boolean {
    return this._value() === null;
  }
  public readonly id = `rxap-upload-button-${ UploadButtonComponent.nextId++ }`;
  // endregion

  private onChange?: (file: File) => any;
  private onTouched?: () => any;

  public readonly snackBar = inject(MatSnackBar);

  private readonly _elementRef = inject(ElementRef);
  private readonly document = inject(DOCUMENT);

  constructor() {
    if (this.ngControl != null) {
      this.ngControl.valueAccessor = this;
    }
    // notify the mat-form-field about changes of the signal based state
    effect(() => {
      this.placeholderInput();
      this._disabled();
      this.requiredInput();
      this._value();
      untracked(() => this.stateChanges.next());
    });
  }

  get isImage(): boolean {
    return !!this.value?.type.match(/^image\//);
  }

  // region MatFormFieldControl
  // eslint-disable-next-line @typescript-eslint/no-empty-function
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

  public registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  public setDisabledState(isDisabled: boolean) {
    this._disabled.set(isDisabled);
  }
  // endregion

  public writeValue(file: File): void {
    this._value.set(file);
  }

  public openOverlay() {
    if (this.value?.type.match(/^image\//)) {
      this.isImageUploaded.set(true);
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

  onFileInputChange($event: any) {
    const files: { [key: string]: File } = $event?.target?.files as any ?? {};
    const file = Object.values(files)[0];
    if (!file) {
      this.snackBar.open('No file selected', 'close', { duration: 3000 });
    } else {
      this.uploaded.emit(file);
      this._value.set(file);
      if (this.onChange) {
        this.onChange(file);
      }
      this.stateChanges.next();
    }
  }

  clear() {
    this._value.set(null);
  }

}
