import { Tree } from '@angular-devkit/schematics';
import {
  HasComponent,
  HasComponentOptions,
} from '@rxap/schematics-ts-morph';
import { CoerceSuffix } from '@rxap/schematics-utilities';

export function hasMissingPanelComponents(
  host: Tree,
  itemList: string[],
  {
    project,
    feature,
    directory,
  }: Omit<HasComponentOptions, 'name'>,
): boolean {
  const hasMissing = itemList.some(
    (item) =>
      !HasComponent(host, {
        project,
        feature,
        directory,
        name: CoerceSuffix(item, '-panel'),
      }),
  );
  if (hasMissing) {
    console.log(
      `Missing panel components for accordion '${ itemList.join(
        ', ',
      ) }'. Overwrite accordion component template`,
    );
  }
  return hasMissing;
}