import { chain } from '@angular-devkit/schematics';
import { CoerceTreeOperationRule } from '@rxap/schematics-ts-morph';
import { NormalizeTreeComponentOptions } from './normalize-tree-component-options';
import { TreeComponentOptions } from './schema';

export default function (options: TreeComponentOptions) {
  const normalizedOptions = NormalizeTreeComponentOptions(options);
  const {
    fullTree,
    project,
    feature,
    shared,
    controllerName,
    overwrite,
    backend,
  } =
    normalizedOptions;



  return () => {
    return chain([
      CoerceTreeOperationRule({
        project,
        feature,
        shared,
        backend,
        controllerName,
        fullTree,
        overwrite,
      }),
    ]);
  };
}
