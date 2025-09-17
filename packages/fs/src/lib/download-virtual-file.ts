import {
  SyncVirtualFileLike,
  VirtualFileLike,
} from './virtual-file';

export function downloadBlob(blob: Blob, fileName: string, fileType: string = blob.type): void {

  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.style.display = 'none';
  link.href = url;
  link.download = fileName;
  if (fileType) {
    link.type = fileType;
  }
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);

}

export function downloadArrayBuffer(arrayBuffer: ArrayBuffer, fileName: string, fileType?: string): void {
  const blob = new Blob([ arrayBuffer ], { type: fileType });
  downloadBlob(blob, fileName, fileType);
}

export function downloadVirtualFile(file: VirtualFileLike): void;
export function downloadVirtualFile(file: SyncVirtualFileLike): Promise<void>;
export function downloadVirtualFile(file: VirtualFileLike | SyncVirtualFileLike): Promise<void> | void {
  const data = file.data;
  if ('then' in data) {
    return data.then(d => downloadArrayBuffer(d, file.name, file.mimetype));
  }
  downloadArrayBuffer(data, file.name, file.mimetype);
}

export async function downloadFile(file: File): Promise<void> {
  downloadArrayBuffer(await file.arrayBuffer(), file.name, file.type);
}

export function download(file: SyncVirtualFileLike): void;
export function download(arrayBuffer: ArrayBuffer, fileName: string, fileType?: string): void;
export function download(blob: Blob, fileName: string, fileType?: string): void;
export function download(file: VirtualFileLike): Promise<void>;
export function download(file: File): void | Promise<void>;
export function download(input: File | Blob | ArrayBuffer | VirtualFileLike | SyncVirtualFileLike, fileName?: string, fileType?: string): void | Promise<void> {
  if (input instanceof File) {
    return downloadFile(input);
  }
  if (input instanceof Blob) {
    return downloadBlob(input, fileName!, fileType);
  }
  if (input instanceof ArrayBuffer) {
    return downloadArrayBuffer(input, fileName!, fileType);
  }
  return downloadVirtualFile(input);
}
