import {
  CdkConnectedOverlay,
  CdkOverlayOrigin,
  ConnectedPosition,
} from '@angular/cdk/overlay';
import {
  AsyncPipe,
  DOCUMENT,
  NgIf,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  inject,
  Input,
  isDevMode,
  OnDestroy,
  Output,
} from '@angular/core';
import { FlexModule } from '@angular/flex-layout/flex';
import {
  ControlValueAccessor,
  NgControl,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldControl } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MethodDirective } from '@rxap/directives';
import { Subject } from 'rxjs';
import { FILE_UPLOAD_METHOD } from '../tokens';
import { ReadAsDataURLPipe } from './read-as-data-url.pipe';

@Component({
  selector: 'rxap-upload-button',
  templateUrl: './upload-button.component.html',
  styleUrls: [ './upload-button.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: { class: 'rxap-upload-button' },
  providers: [
    {
      provide: MatFormFieldControl,
      useExisting: UploadButtonComponent,
    },
  ],
  standalone: true,
  imports: [
    FlexModule,
    MatButtonModule,
    CdkOverlayOrigin,
    MethodDirective,
    MatIconModule,
    NgIf,
    MatProgressSpinnerModule,
    MatTooltipModule,
    CdkConnectedOverlay,
    AsyncPipe,
    ReadAsDataURLPipe,
  ],
})
export class UploadButtonComponent implements ControlValueAccessor, MatFormFieldControl<File>, OnDestroy {

  static nextId = 0;

  @Input()
  public accept = '**/**';

  @Output()
  public uploaded = new EventEmitter<File>();
  @Input()
  public disabled = false;
  public isOpen = false;
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
  autofilled?: boolean | undefined;
  controlType?: string | undefined = 'rxap-upload-button';
  errorState = false;
  focused = false;
  @Input()
  public required = false;
  shouldLabelFloat = true;
  public stateChanges = new Subject<void>();
  userAriaDescribedBy?: string | undefined;
  public value: File | null = null;
  private onChange?: (file: File) => any;
  private onTouched?: () => any;

  public readonly fileUpload = inject(FILE_UPLOAD_METHOD);
  public readonly ngControl = inject(NgControl, {
    optional: true,
    self: true,
  });
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly _elementRef = inject(ElementRef);
  private readonly document = inject(DOCUMENT);

  constructor() {
    this.fileUpload.setDocument(this.document);
    if (this.ngControl != null) {
      this.ngControl.valueAccessor = this;
    }
  }

  get isImage(): boolean {
    return !!this.value?.type.match(/^image\//);
  }

  private _placeholder!: string;

  @Input()
  get placeholder() {
    return this._placeholder;
  }

  set placeholder(plh) {
    this._placeholder = plh;
    this.stateChanges.next();
  }

  public get empty(): boolean {
    return this.value === null;
  }

  public get id(): string {
    return `rxap-upload-button-${ UploadButtonComponent.nextId++ }`;
  }

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
