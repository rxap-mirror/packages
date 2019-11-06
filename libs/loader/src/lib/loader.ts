import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { Type } from '@angular/core';

export type LoaderFunction = () => PromiseLike<any>;

export function RxapLoader(appModule: Type<any>, ...loader: LoaderFunction[]) {
  Promise.all(loader).then(() => {
    platformBrowserDynamic()
      .bootstrapModule(appModule)
      .catch(err => console.error(err));
  });
}
