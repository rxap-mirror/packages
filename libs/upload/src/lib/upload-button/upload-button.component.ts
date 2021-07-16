import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  forwardRef,
  ChangeDetectorRef
} from '@angular/core';
import { FileUploadMethod } from '../file-upload.method';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR
} from '@angular/forms';
import { ConnectedPosition } from '@angular/cdk/overlay';

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
    }
  ]
})
export class UploadButtonComponent implements ControlValueAccessor {

  @Input()
  public accept = '**/**';

  @Output()
  public uploaded = new EventEmitter<File>();

  get isImage(): boolean {
    return !!this.file?.type.match(/^image\//);
  }

  @Input()
  public disabled                       = false;
  public file: File | null              = null;
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

  constructor(
    public readonly fileUpload: FileUploadMethod,
    private readonly cdr: ChangeDetectorRef
  ) { }

  public uploadComplete(file: File) {
    this.uploaded.emit(file);
    this.file = file;
    if (this.onChange) {
      this.onChange(file);
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
    this.file = file;
  }

  public openOverlay() {
    if (this.file) {
      if (this.file.type.match(/^image\//)) {
        this.isOpen = true;
        this.cdr.detectChanges();
      }
    }
  }

}
