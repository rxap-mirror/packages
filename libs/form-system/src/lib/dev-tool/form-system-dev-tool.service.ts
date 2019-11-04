import { Injectable } from '@angular/core';
import { FormTemplateLoader } from '../form-template-loader';
import { fromEvent } from 'rxjs';
import {
  filter,
  map,
  tap,
  mergeMap,
  switchMap
} from 'rxjs/operators';
import { FormInstanceFactory } from '../form-instance-factory';
import { isDefined } from '@rxap/utilities';
import { FormInstance } from '../form-instance';

interface FileSystemHandlePermissionDescriptor {
  writable: boolean;
}

enum PermissionState {
  "granted",
  "denied",
  "prompt",
}

interface FileSystemHandle {
  readonly isFile: boolean;
  readonly isDirectory: boolean;
  readonly name: string;

  queryPermission(descriptor?: FileSystemHandlePermissionDescriptor): Promise<PermissionState>;
  requestPermission(descriptor?: FileSystemHandlePermissionDescriptor): Promise<PermissionState>;
}

interface FileSystemCreateWriterOptions {
  keepExistingData: boolean;
}

interface FileSystemWriter {
  write(position: number, data: any): Promise<void>;
  truncate(size: number): Promise<void>;
  close(): Promise<void>;
}

interface FileSystemFileHandle extends FileSystemHandle {
  getFile(): Promise<File>;
  createWriter(options?: FileSystemCreateWriterOptions): Promise<FileSystemWriter>;
}

interface FileSystemGetFileOptions {
  create: boolean;
}

interface FileSystemGetDirectoryOptions {
  create: boolean;
}

interface FileSystemRemoveOptions {
  recursive: boolean;
}


enum ChooseFileSystemEntriesType { 'openFile' = 'openFile', 'saveFile' = 'saveFile', 'openDirectory' = 'openDirectory' }

interface FileSystemDirectoryHandle extends FileSystemHandle {
  getFile(name: string, options?: FileSystemGetFileOptions): Promise<FileSystemFileHandle>
  getDirectory(name: string, options?: FileSystemGetDirectoryOptions): Promise<FileSystemDirectoryHandle>;

  // This really returns an async iterable, but that is not yet expressable in WebIDL.
  getEntries(): any;

  removeEntry(name: string, options: FileSystemRemoveOptions): Promise<void>;
}

@Injectable()
export class FormSystemDevToolService {

  constructor(
    public formTemplateLoader: FormTemplateLoader,
    public formInstances: FormInstanceFactory
  ) {}

  public start() {

    const message$ = fromEvent<MessageEvent>(window, 'message').pipe(
      filter(event => event.source === window),
      map(event => event.data),
      filter(data => data.rxap_form),
    );

    message$.pipe(
      filter(data => data.content_loaded),
      tap(() => this.send({ start_connection: true }))
    ).subscribe();

    message$.pipe(
      filter(data => data.getAll),
      tap(() => {
        for (const [ formId, template ] of this.formTemplateLoader.templates.entries()) {
          this.send({ formId, template });
        }
      })
    ).subscribe();

    message$.pipe(
      filter(data => data.saveAll),
      switchMap(() => this.saveAllTemplates()),
    ).subscribe();

    const withInstanceId$ = message$.pipe(
      filter(data => data.instanceId)
    );

    withInstanceId$.pipe(
      filter(data => data.getValue),
      map(data => this.formInstances.getFormInstanceById(data.instanceId)),
      isDefined(),
      mergeMap((instance: FormInstance<any>) => instance.formDefinition.group.valueChanged$.pipe(
        tap(value => this.send({ instanceId: instance.instanceId, value }))
      ))
    ).subscribe();

    withInstanceId$.pipe(
      filter(data => data.getErrors),
      map(data => this.formInstances.getFormInstanceById(data.instanceId)),
      isDefined(),
      mergeMap((instance: FormInstance<any>) => instance.formDefinition.group.errorTreeChange$.pipe(
        tap(errors => this.send({ instanceId: instance.instanceId, errors }))
      ))
    ).subscribe();

    const withFormId$ = message$.pipe(
      filter(data => data.formId)
    );

    const withFormTemplate$ = withFormId$.pipe(filter(data => data.template));

    withFormTemplate$.pipe(
      tap(data => this.formTemplateLoader.updateTemplate(data.formId, data.template))
    ).subscribe();

    withFormId$.pipe(
      filter(data => data.getInstances),
      tap(data => {

        const instanceIds = this.formInstances.getFormInstanceIdsByFormId(data.formId);

        this.send({ formId: data.formId, instanceIds });

      })
    ).subscribe();

    withFormTemplate$.pipe(
      filter(data => data.save),
      switchMap(data => this.writeToFile(`${data.formId}.xml`, data.template))
    ).subscribe();

  }

  public async writeToFile(filename: string, content: string): Promise<void> {

    const file = await (window as any)[ 'chooseFileSystemEntries' ]({ accepts: [{ extensions: 'xml' }], type: ChooseFileSystemEntriesType.saveFile });

    const writer = await file.createWriter();
    await writer.truncate(0);
    await writer.write(0, content);
    await writer.close();

  }

  public async saveAllTemplates(): Promise<void> {

    const folder: FileSystemDirectoryHandle = await (window as any)[ 'chooseFileSystemEntries' ]({ type: ChooseFileSystemEntriesType.openDirectory });

    // await folder.requestPermission({ writable: true });

    for (const [formId, template] of this.formTemplateLoader.templates.entries()) {
      const file = await folder.getFile(`${formId}.xml`);
      const writer = await file.createWriter();
      await writer.truncate(0);
      await writer.write(0, template);
      await writer.close();
    }

  }

  public send(data: any): void {
    window.postMessage({ ...data, rxap_form: true }, '*');
  }

}
