import {
  fromEvent,
  Subject
} from 'rxjs';
import {
  map,
  switchMap,
  take
} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Method } from '@rxap/utilities/rxjs';

@Injectable()
export class FileUploadMethod implements Method<File, { accept: string }> {

  public progress$: Subject<number> = new Subject<number>();

  private _fileInput: HTMLInputElement | null = null;

  private handleFileInputChange(event: any): File {
    this.removeInputFromDom();
    const files: { [ key: string ]: File } = event?.target?.files as any ?? {};
    if (Object.keys(files).length !== 1) {
      throw new Error('File upload failed');
    }
    let file: File | null = null;
    for (const key in files) {
      if (!isNaN(parseInt(key, 10))) {
        file = files[ key ];
      }
    }
    if (!file) {
      throw new Error('File upload failed');
    }
    return file;
  }

  private removeInputFromDom(): void {
    if (this._fileInput) {
      document.body.removeChild(this._fileInput);
    }
    this._fileInput = null;
  }

  public call(parameters?: { accept?: string }): Promise<File> {
    const fileInput = this.addInputToDom(parameters?.accept ?? '**/**');

    const change$ = fromEvent(fileInput, 'change').pipe(
      map(event => this.handleFileInputChange(event)),
      switchMap(file => this.readFile(file)),
      take(1)
    );

    fileInput.click();

    return change$.toPromise();
  }

  private readFile(file: File): Promise<File> {
    const reader = new FileReader();

    const loadFile$ = fromEvent<any>(reader, 'load').pipe(
      map(event => new File([ event.target.result ], file.name, { type: file.type, lastModified: file.lastModified })),
      take(1)
    );

    fromEvent(reader, 'progress').pipe(
      map((progress: Event) => {
        if (progress instanceof ProgressEvent) {
          return progress.loaded / progress.total * 100;
        }
        throw new Error('The progress event is not an instance of ProgressEvent');
      })
    ).subscribe(this.progress$);

    reader.readAsArrayBuffer(file);

    return loadFile$.toPromise();
  }

  private addInputToDom(accept: string): HTMLInputElement {
    const fileInput = document.createElement('input');
    fileInput.setAttribute('type', 'file');
    fileInput.setAttribute('style', 'display: none');
    fileInput.setAttribute('accept', accept);
    document.body.appendChild(fileInput);
    return this._fileInput = fileInput;
  }

}
