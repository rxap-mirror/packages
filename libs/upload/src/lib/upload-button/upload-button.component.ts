import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { FileUploadMethod } from '../file-upload.method';

@Component({
  selector:        'rxap-upload-button',
  templateUrl:     './upload-button.component.html',
  styleUrls:       [ './upload-button.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host:            { class: 'rxap-upload-button' }
})
export class UploadButtonComponent {

  @Input()
  public accept = '**/**';

  @Output()
  public uploaded = new EventEmitter<File>();

  constructor(
    public readonly fileUpload: FileUploadMethod
  ) { }

}
