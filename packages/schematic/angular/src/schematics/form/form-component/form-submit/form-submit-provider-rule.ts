import {
  chain,
  Rule,
} from '@angular-devkit/schematics';
import { CoerceFormComponentProviderRule } from '@rxap/schematics-ts-morph';
import {
  OperationIdToClassRemoteMethodImportPath,
  OperationIdToRemoteMethodClassName,
} from '@rxap/ts-morph';
import { getSubmitOperationId } from '../get-submit-operation-id';
import { NormalizedFormComponentOptions } from '../normalize-form-component-options';

export function formSubmitProviderRule(normalizedOptions: NormalizedFormComponentOptions): Rule {
  const {
    project,
    feature,
    directory,
    scope,
  } = normalizedOptions;
  const submitOperationId = getSubmitOperationId(normalizedOptions);
  return chain([
    () => console.log(`Coerce form submit method`),
    CoerceFormComponentProviderRule({
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
          moduleSpecifier: '@rxap/form-system',
          namedImports: [ 'SubmitContextFormAdapterFactory' ],
        },
        {
          moduleSpecifier: '@rxap/forms',
          namedImports: [ 'RXAP_FORM_SUBMIT_METHOD', 'RXAP_FORM_CONTEXT' ],
        },
        {
          moduleSpecifier: '@angular/core',
          namedImports: [ 'Optional' ],
        },
        {
          moduleSpecifier: OperationIdToClassRemoteMethodImportPath(submitOperationId, scope),
          namedImports: [ OperationIdToRemoteMethodClassName(submitOperationId) ],
        },
      ],
    }),
  ]);
}