import {
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { isDevMode } from '@angular/core';
import { HttpRemoteMethodParameter } from '@rxap/remote-method/http';
import {
  coerceArray,
  isPromiseLike,
  IsRecord,
} from '@rxap/utilities';
import Ajv from 'ajv';
import { OpenAPIV3 } from 'openapi-types';
import { RxapOpenApiError } from './error';
import { OperationObjectWithMetadata } from './open-api';
import {
  IsReferenceObject,
  NotContainsReferenceObjects,
} from './utilities';

export interface SchemaValidationResponse<Data> {
  headers: HttpHeaders;
  status: number;
  body?: Data | null;
  data?: Data;
}

export class SchemaValidationMixin<Response = any, Parameters extends Record<string, any> | void = any, RequestBody = any> {

  public static STRICT = false;

  protected disableSchemaValidation?: boolean;

  /**
   * Validates the parameters against the schema specified in the operation object
   *
   * @param operation
   * @param parameters
   * @param strict
   * @protected
   */
  public validateParameters(operation: OperationObjectWithMetadata, parameters?: Parameters, strict = false): void {

    const operationParameters = coerceArray(operation.parameters);

    if (!NotContainsReferenceObjects<OpenAPIV3.ParameterObject>(operationParameters)) {
      throw new RxapOpenApiError('The operation parameters contains ReferenceObject!');
    }

    if (parameters === undefined) {
      // TODO : find concept to definition witch parameter should not be checked if required
      // header parameters are never required if changes the semantic release manager breaks
      const requiredParameters = operationParameters.filter(parameter => parameter.required &&
        parameter.in !==
        'header');
      if (requiredParameters.length) {
        if (isDevMode()) {
          console.debug('Some operation parameters are required!', requiredParameters.map(p => p.name));
        }
        this.validationError('Some operation parameters are required!', strict);
      }

    } else if (IsRecord(parameters)) {

      for (const parameter of operationParameters) {

        if (parameter.required) {
          // header parameters are never required if changes the semantic release manager breaks
          if (parameter.in !== 'header') {
            if (!parameters.hasOwnProperty(parameter.name)) {
              this.validationError(`The operation parameter '${ parameter.name }' is required!`, strict);
            }
          }
        }


        if (parameter.schema) {
          if (parameters.hasOwnProperty(parameter.name)) {

            const value = parameters[parameter.name];

            if (!this.validate(parameter.schema, value)) {
              this.validationError(
                `The parameter '${ parameter.name }' is not valid against the schema!`,
                strict,
                parameter.schema,
                value,
              );
            }

          }
        }

      }

    } else {
      if (operationParameters.length === 0 || operationParameters.every(op => !op.required)) {
        if (isDevMode()) {
          console.warn(
            `The operation ${ operation.operationId } does not expect any parameters. But a parameter is provided.`,
            parameters,
          );
        }
      } else {
        throw new Error('The parameters object is not a record');
      }
    }

  }

  /**
   * Validates the http response against the schema specified in the operation object
   *
   * @param operation
   * @param response
   * @param strict
   * @protected
   */
  public validateResponse(
    operation: OperationObjectWithMetadata,
    response: SchemaValidationResponse<Response>,
    strict = false,
  ): void {

    // region only validate the response if the content type is undefined or application/json

    const contentType = response.headers.get('Content-Type');

    if (contentType && contentType !== 'application/json') {
      if (isDevMode()) {
        console.warn('Response validation is only supported for content type application/json');
      }
      return;
    }

    // endregion

    if (operation.responses) {

      const status = response.status;

      // region extract the response object based on the response status
      let responseObject: OpenAPIV3.ResponseObject | OpenAPIV3.ReferenceObject | undefined;

      if (operation.responses[status]) {
        responseObject = operation.responses[status];
      } else {
        // use the default response object if no matching was found.
        responseObject = operation.responses['default'];
      }
      // endregion

      if (responseObject) {

        if (IsReferenceObject(responseObject)) {
          throw new RxapOpenApiError('Found a reference object. The operation config is not expand!');
        }

        // region validate the response against the schema if defined

        // TODO : create schema that validates all parameters at once

        if (responseObject.content &&
          responseObject.content['application/json'] &&
          responseObject.content['application/json'].schema) {

          const schema = responseObject.content['application/json'].schema;

          const data = response.body ?? response.data;

          if (!this.validate(schema, data)) {
            this.validationError('The response is not valid ageist the operation schema!', strict, schema, data);
          }

        }

        // endregion

      }


    }

  }

  public validateRequestBody(operation: OperationObjectWithMetadata, body?: RequestBody, strict = false): void {

    // only validate body if type of object
    if (typeof body !== 'object') {
      return;
    }

    if (operation.requestBody) {

      if (IsReferenceObject(operation.requestBody)) {
        throw new RxapOpenApiError('Found a reference object. The operation config is not expand!');
      }

      if (body === undefined && operation.requestBody.required) {
        this.validationError('The request body is required!', strict);
      }

      if (operation.requestBody.content && operation.requestBody.content['application/json']) {

        const schema = operation.requestBody.content['application/json'].schema;

        if (schema) {
          if (!this.validate(schema, body)) {
            this.validationError('The request body is not valid!', strict, schema, body);
          }
        }

      }

    }

  }

  public validationError(
    message: string,
    strict: boolean,
    schema?: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject,
    value?: any,
  ) {
    if (isDevMode() && schema !== undefined) {
      console.debug(
        message,
        {
          schema,
          value,
        },
      );
    }
    if (strict || SchemaValidationMixin.STRICT) {
      throw new RxapOpenApiError(message, '', 'SchemaValidationMixin');
    } else {
      console.warn(message);
    }
  }

  public buildHttpParams(
    operationParameters: OpenAPIV3.ParameterObject[],
    parameters?: Parameters,
    ignoreUndefined = true,
  ): HttpParams {

    let params = new HttpParams();

    if (IsRecord(parameters)) {

      for (const parameter of operationParameters.filter(p => p.in === 'query')) {
        const parameterName = parameter.name;

        if (parameters.hasOwnProperty(parameter.name)) {

          const value = parameters[parameter.name];

          if (value === undefined && ignoreUndefined) {
            continue;
          }

          if (Array.isArray(value)) {

            if (value.length) {

              const first = value.shift();

              params = params.set(parameterName, typeof first === 'object' ? JSON.stringify(first) : first);

              for (const item of value) {
                params = params.append(parameterName, typeof item === 'object' ? JSON.stringify(item) : item);
              }

            }

          } else {
            params = params.set(parameter.name, typeof value === 'object' ? JSON.stringify(value) : value);
          }

        }

      }

    }

    return params;

  }

  public buildHttpHeaders(operationParameters: OpenAPIV3.ParameterObject[], parameters?: Parameters): HttpHeaders {

    let headers = new HttpHeaders();

    if (IsRecord(parameters)) {

      for (const parameter of operationParameters.filter(p => p.in === 'header')) {

        if (parameters.hasOwnProperty(parameter.name)) {

          const value = parameters[parameter.name];

          if (Array.isArray(value)) {

            if (value.length) {

              const first = value.shift();

              headers = headers.set(parameters['name'], typeof first === 'object' ? JSON.stringify(first) : first);

              for (const item of value) {
                headers = headers.append(parameters['name'], typeof item === 'object' ? JSON.stringify(item) : item);
              }

            }

          } else {
            headers = headers.set(parameter.name, typeof value === 'object' ? JSON.stringify(value) : value);
          }

        }

      }

    }

    return headers;

  }

  public buildHttpPathParams(
    operationParameters: OpenAPIV3.ParameterObject[],
    parameters?: Parameters,
  ): Record<string, string> {

    const pathParams: Record<string, any> = {};

    if (IsRecord(parameters)) {

      for (const parameter of operationParameters.filter(p => p.in === 'path')) {

        if (parameters.hasOwnProperty(parameter.name)) {
          pathParams[parameter.name] = encodeURIComponent(typeof parameters[parameter.name] === 'object' ?
            JSON.stringify(parameters[parameter.name]) :
            parameters[parameter.name]);
        }

      }

    }

    return pathParams;

  }

  /**
   * Converts open api parameters into the corresponding http options to
   * create a http request. The transformation is guided by the openapi definition
   *
   * @param operation
   * @param parameters
   * @param requestBody
   * @param ignoreUndefined
   */
  public buildHttpOptions(
    operation: OperationObjectWithMetadata,
    parameters?: Parameters,
    requestBody?: RequestBody,
    ignoreUndefined = true,
  ): HttpRemoteMethodParameter {

    const options: HttpRemoteMethodParameter = {};

    const operationParameters = coerceArray(operation.parameters);

    if (!NotContainsReferenceObjects<OpenAPIV3.ParameterObject>(operationParameters)) {
      throw new RxapOpenApiError('The operation parameters contains ReferenceObject!');
    }

    const params = this.buildHttpParams(operationParameters, parameters, ignoreUndefined);
    const headers = this.buildHttpHeaders(operationParameters, parameters);
    const pathParams: Record<string, any> = this.buildHttpPathParams(operationParameters, parameters);

    if (params.keys().length) {
      options.params = params;
    }

    if (headers.keys().length) {
      options.headers = headers;
    }

    if (Object.keys(pathParams).length) {
      options.pathParams = pathParams;
    }

    if (requestBody !== undefined) {
      options.body = requestBody;
    }

    return options;

  }

  private validate(schema: string | boolean | object, value: any): boolean {

    if (this.disableSchemaValidation) {
      return true;
    }

    if (typeof schema !== 'object') {
      throw new Error('The schema must be an object!');
    }

    if (!schema) {
      throw new Error('The schema must not be null or undefined!');
    }

    let result: boolean | PromiseLike<any>;

    const ajv = new Ajv();
    const validate = ajv.compile(schema);

    try {
      result = validate(value);
    } catch (e: any) {
      console.error(e.message);
      return false;
    }

    if (isPromiseLike(result)) {
      throw new Error(
        'Async schema validation is not yet supported. Ensure the all refs in the openapi schema are internal!');
    }

    return result;
  }

}
