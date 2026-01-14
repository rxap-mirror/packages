import { chain } from '@angular-devkit/schematics';
import {
  AbstractControlToDataProperty,
  NormalizedControl,
} from '@rxap/schematic-angular';
import {
  CoerceFormDefinitionTypeRule,
  CoerceFormProviderRule,
  CoerceSubmitDataGridOperation,
} from '@rxap/schematics-ts-morph';
import {
  CoerceImports,
  OperationIdToClassRemoteMethodImportPath,
  OperationIdToRemoteMethodClassName,
  OperationIdToRequestBodyClassImportPath,
  OperationIdToRequestBodyClassName,
  OperationIdToResponseClassImportPath,
  OperationIdToResponseClassName,
} from '@rxap/ts-morph';
import {
  ClassDeclaration,
  SourceFile,
} from 'ts-morph';
import { buildGetOperationId } from '../build-get-operation-id';
import { buildSubmitOperationId } from '../build-submit-operation-id';
import { NormalizedDataGridComponentOptions } from '../normalize-data-grid-component-options';

export function nestjsFormModeRule(normalizedOptions: NormalizedDataGridComponentOptions) {

  const {
    project,
    feature,
    nestModule,
    name,
    directory,
    shared,
    itemList,
    collection,
    scope,
    overwrite,
    identifier,
    controllerName,
    backend,
  } = normalizedOptions;

  const submitOperationId = buildSubmitOperationId(normalizedOptions);
  const getOperationId = buildGetOperationId(normalizedOptions);
  const dataGridResponseClassName = OperationIdToResponseClassName(getOperationId);
  const dataGridSubmitClassName = OperationIdToRequestBodyClassName(submitOperationId);

  return chain([
    () => console.log('Coerce form provider rule for the data grid data source submit method ...'),
    CoerceFormProviderRule({
      project,
      feature,
      directory,
      providerObject: {
        provide: 'RXAP_FORM_SUBMIT_METHOD',
        useFactory: 'SubmitContextFormAdapterFactory',
        deps: [
          OperationIdToRemoteMethodClassName(submitOperationId),
          '[ new Optional(), RXAP_FORM_CONTEXT ]',
        ],
      },
      importStructures: [
        {
          namedImports: [ 'Optional' ],
          moduleSpecifier: '@angular/core',
        },
        {
          namedImports: [
            'RXAP_FORM_SUBMIT_METHOD',
            'RXAP_FORM_CONTEXT',
          ],
          moduleSpecifier: '@rxap/forms',
        },
        {
          namedImports: [ 'SubmitContextFormAdapterFactory' ],
          moduleSpecifier: '@rxap/form-system',
        },
        {
          namedImports: [ OperationIdToRemoteMethodClassName(submitOperationId) ],
          moduleSpecifier:
            OperationIdToClassRemoteMethodImportPath(submitOperationId, scope),
        },
      ],
    }),
    CoerceFormDefinitionTypeRule({
      project,
      feature,
      directory,
      name,
      coerceFormType: (
        sourceFile: SourceFile,
        classDeclaration: ClassDeclaration,
        formTypeName: string,
      ) => {
        sourceFile.getInterface(formTypeName)?.remove();
        const typeAliasDeclaration =
          sourceFile.getTypeAlias(formTypeName) ??
          sourceFile.addTypeAlias({
            name: formTypeName,
            type: 'unknown',
          });
        typeAliasDeclaration.setIsExported(true);
        const excludedProperties = itemList
          .filter(item => !item.formControl)
          .map(item => item.name)
          .filter(name => !itemList.filter(i => i.formControl).some(i => i.formControl?.name === name));
        // if an identifier is defined and the identifier is not an item with a form control add the identifier property to the excluded properties list
        if (identifier && !itemList.some(item => item.formControl?.name === identifier?.property.name)) {
          excludedProperties.push(identifier.property.name);
        }
        let getType: string = dataGridResponseClassName;
        if (excludedProperties.length) {
          getType = `Omit<${ dataGridResponseClassName }, '${ excludedProperties.join('\' | \'') }'>`;
        }
        typeAliasDeclaration.setType(`Partial<${ getType }> & ${ dataGridSubmitClassName }`);
        CoerceImports(sourceFile, {
          namedImports: [ dataGridSubmitClassName ],
          moduleSpecifier: OperationIdToRequestBodyClassImportPath(submitOperationId, scope),
        });
        CoerceImports(sourceFile, {
          namedImports: [ dataGridResponseClassName ],
          moduleSpecifier: OperationIdToResponseClassImportPath(getOperationId, scope),
        });
      },
    }),
    () => console.log('Coerce submit operation for the data grid data source ...'),
    CoerceSubmitDataGridOperation({
      controllerName,
      nestModule,
      project,
      feature,
      overwrite,
      shared,
      idProperty: identifier?.property,
      propertyList: itemList
        .map(item => item.formControl)
        .filter((formControl): formControl is NormalizedControl => !!formControl)
        .map(control => AbstractControlToDataProperty(control)),
      skipCoerce: true,
      collection,
      backend,
    }),
  ]);

}