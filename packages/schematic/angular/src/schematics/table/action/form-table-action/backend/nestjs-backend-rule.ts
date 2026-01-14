import {
  chain,
  Rule,
} from '@angular-devkit/schematics';
import { ControlToDtoClassProperty } from '../../../../../lib/form/control-to-dto-class-property';
import {
  CoerceFormSubmitOperation,
  CoerceOperation,
} from '@rxap/schematics-ts-morph';
import {
  CoerceDtoClass,
  CoerceImports,
} from '@rxap/ts-morph';
import {
  CoerceSuffix,
  dasherize,
} from '@rxap/utilities';
import { join } from 'path';
import { buildGetOperationId } from '../build-get-operation-id';
import { NormalizedFormTableActionOptions } from '../normalize-form-table-action-options';
import { UseOperationResponseAsFormTypeRule } from '../use-operation-response-as-form-type-rule';

export function nestjsBackendRule(normalizedOptions: NormalizedFormTableActionOptions): Rule {

  const {
    project,
    feature,
    shared,
    directory,
    nestModule,
    type,
    context,
    controllerName,
    scope,
    backend,
    overwrite,
  } = normalizedOptions;

  if (!nestModule) {
    throw new Error('The nest module is required');
  }

  if (!controllerName) {
    throw new Error('The controller name is required');
  }

  const controllerPath = `${ dasherize(nestModule) }/action/:rowId/${ type }`;

  return chain([
    () => console.log('Coerce form get table action operation'),
    CoerceOperation({
      controllerName,
      nestModule,
      project,
      feature,
      shared,
      context,
      overwrite,
      operationName: `get`,
      controllerPath,
      backend,
      tsMorphTransform: (
        project,
        sourceFile,
      ) => {

        const getDtoPropertyList = normalizedOptions.form?.controlList.map(
          control => ControlToDtoClassProperty(control)) ?? [];

        // set all properties to optional, as it is possible that a property is required for submitting
        // but not for getting the initial form data
        getDtoPropertyList.forEach(property => {
          property.isOptional = true;
        });

        const {
          className,
          filePath,
        } = CoerceDtoClass({
          project,
          name: controllerName,
          propertyList: getDtoPropertyList,
        });

        CoerceImports(sourceFile, {
          namedImports: [ className ],
          moduleSpecifier: filePath,
        });

        return {
          returnType: className,
          paramList: [
            {
              name: 'rowId',
              fromParent: true,
            },
          ],
        };
      },
    }),
    () => console.log('Coerce form submit table action operation'),
    CoerceFormSubmitOperation({
      controllerName,
      project,
      feature,
      shared,
      nestModule,
      context,
      backend,
      controllerPath,
      overwrite,
      paramList: [
        {
          name: 'rowId',
          fromParent: true,
        },
      ],
      bodyDtoName: controllerName,
    }),
    () => console.log('Update form type alias'),
    UseOperationResponseAsFormTypeRule({
      scope,
      project,
      feature,
      directory: join(directory ?? '', CoerceSuffix(type, '-form')),
      name: type,
      operationId: buildGetOperationId(normalizedOptions),
    }),
  ]);

}