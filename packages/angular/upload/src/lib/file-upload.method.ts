import {
  firstValueFrom,
  fromEvent,
  of,
  race,
  Subject,
} from 'rxjs';
import {
  map,
  switchMap,
  take,
} from 'rxjs/operators';
import {
  Inject,
  Injectable,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Method } from '@rxap/pattern';

@Injectable()
export class FileUploadMethod implements Method<File | null, { accept: string }> {

  public progress$: Subject<number> = new Subject<number>();

  private _fileInput: HTMLInputElement | null = null;

  constructor(
    @Inject(DOCUMENT)
    private readonly document: Document,
  ) {
  }

  public call(parameters?: { accept?: string }): Promise<File | null> {
    const fileInput = this.addInputToDom(parameters?.accept ?? '**/**');

    const change$ = fromEvent(fileInput, 'change').pipe(
      map(event => this.handleFileInputChange(event)),
      switchMap(file => file ? this.readFile(file) : of(null)),
      take(1),
    );

    const cancel$ = fromEvent(this.document.body, 'focus').pipe(take(1), map(() => null));

    fileInput.click();

    return firstValueFrom(race(
      change$,
      cancel$,
    ));
  }

  private handleFileInputChange(event: any): File | null {
    this.removeInputFromDom();
    const files: { [key: string]: File } = event?.target?.files as any ?? {};
    if (Object.keys(files).length !== 1) {
      throw new Error('File upload failed');
    }
    let file: File | null = null;
    for (const key in files) {
      if (!isNaN(parseInt(key, 10))) {
        file = files[key];
      }
    }
    return file;
  }

  private removeInputFromDom(): void {
    if (this._fileInput) {
      this.document.body.removeChild(this._fileInput);
    }
    this._fileInput = null;
  }

  private readFile(file: File): Promise<File> {
    const reader = new FileReader();

    const loadFile$ = fromEvent<any>(reader, 'load').pipe(
      map(event => new File([event.target.result], file.name, {type: file.type, lastModified: file.lastModified})),
      take(1),
    );

    fromEvent(reader, 'progress').pipe(
      map((progress: Event) => {
        if (progress instanceof ProgressEvent) {
          return progress.loaded / progress.total * 100;
        }
        throw new Error('The progress event is not an instance of ProgressEvent');
      }),
    ).subscribe(this.progress$);

    reader.readAsArrayBuffer(file);

    return firstValueFrom(loadFile$);
  }

  private addInputToDom(accept: string): HTMLInputElement {
    const fileInput = this.document.createElement('input');
    fileInput.setAttribute('type', 'file');
    fileInput.setAttribute('style', 'display: none');
    fileInput.setAttribute('accept', accept);
    this.document.body.appendChild(fileInput);
    return this._fileInput = fileInput;
  }

}
