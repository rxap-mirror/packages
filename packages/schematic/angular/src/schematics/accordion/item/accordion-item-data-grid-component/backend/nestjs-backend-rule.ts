import {
  chain,
  SchematicsException,
} from '@angular-devkit/schematics';
import { GetItemOptions } from '@rxap/schematic-angular';
import {
  CoerceDataSourceClass,
  CoerceImports,
  CoerceSubmitDataGridOperation,
} from '@rxap/schematics-ts-morph';
import { CoerceSuffix } from '@rxap/schematics-utilities';
import { OperationParameter } from '@rxap/ts-morph';
import { join } from 'path';
import {
  ClassDeclaration,
  Project,
  SourceFile,
} from 'ts-morph';
import { NormalizedAccordionItemDataGridComponentOptions } from '../normalize-accordion-item-data-grid-component-options';

export function nestjsBackendRule(
  normalizedOptions: NormalizedAccordionItemDataGridComponentOptions,
) {

  const {
    name,
    directory,
    project,
    feature,
    shared,
    identifier,
    upstream,
    controllerName,
    overwrite,
    nestModule,
    backend,
  } = normalizedOptions;
  const {
    hasSharedModifier,
    hasCollectionModifier,
    hasEditModifier,
  } = GetItemOptions(normalizedOptions);

  const paramList: OperationParameter[] = [];

  if (identifier) {
    paramList.push({
      ...identifier.property,
      fromParent: !hasSharedModifier,
    });
  }

  const rules = (
    [
      () => console.log(`Modify the data source class ...`),
      CoerceDataSourceClass({
        project,
        feature,
        shared: hasSharedModifier,
        directory: join(
          directory ?? '',
          CoerceSuffix(name, '-data-grid'),
        ),
        name: CoerceSuffix(name, '-data-grid'),
        tsMorphTransform: (
          project: Project,
          sourceFile: SourceFile,
          classDeclaration: ClassDeclaration,
        ) => {
          const current = classDeclaration.getExtends()?.getText();
          const match = current?.match(/<([^>]+)>/);
          if (!match) {
            throw new SchematicsException(
              `Could not extract the generic type from '${ current }'!`,
            );
          }
          classDeclaration.setExtends(
            `PanelAccordionDataSource<${ match[1] }>`,
          );
          CoerceImports(sourceFile, {
            namedImports: [
              'PanelAccordionDataSource',
            ],
            moduleSpecifier: '@rxap/data-source/accordion',
          });

          sourceFile.getImportDeclaration('@rxap/data-grid')?.remove();
        },
      }),
    ]
  );

  if (hasEditModifier) {
    rules.push(
      () => console.log(`Modify the submit data grid operation ...`),
      CoerceSubmitDataGridOperation({
        controllerName,
        project,
        feature,
        shared,
        nestModule,
        overwrite,
        collection: hasCollectionModifier,
        paramList,
        idProperty: identifier?.property,
        skipCoerce: true,
        backend,
      }),
    );
  }

  return chain(rules);

}