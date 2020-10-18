import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ImageLoaderService {

  private readonly loading = new Map<string, Promise<void>>();
  private readonly loaded  = new Map<string, true>();

  public load(imageSrc: string): Promise<void> {

    if (this.loaded.has(imageSrc)) {
      return Promise.resolve();
    }

    if (this.loading.has(imageSrc)) {
      return this.loading.get(imageSrc)!;
    }

    const loading = new Promise<void>((resolve, reject) => {
      const image = new Image();
      image.src   = imageSrc;

      image.onerror = reject;
      image.onload  = () => resolve();
    }).then(() => {
      this.loaded.set(imageSrc, true);
    }).finally(() => {
      this.loading.delete(imageSrc);
    });

    this.loading.set(imageSrc, loading);

    return loading;
  }

}
