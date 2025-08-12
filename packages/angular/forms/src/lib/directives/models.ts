import {
  Method,
  MethodWithParameters,
} from '@rxap/pattern';

export interface FormSubmitMethod<FormSate = any, Context = any, Initial = any> extends MethodWithParameters<any, FormSate> {
  call(parameters: FormSate, context?: Context | null, initial?: Initial | null): any | Promise<any>;
}

export interface FormLoadMethod<FormState = any, Context = any, Initial = any> extends Method<FormState> {
  call(data: { context: Context | null, initial: Initial | null }): FormState | Promise<FormState>;
}

export interface FormLoadFailedMethod extends MethodWithParameters {
  call(error: Error): Promise<any> | any;
}

export interface FormLoadSuccessfulMethod<T = any> extends Method {
  call(value: T): Promise<any> | any;
}

export interface FormSubmitFailedMethod extends MethodWithParameters {
  call(error: Error): Promise<any> | any;
}

export interface FormSubmitSuccessfulMethod<T = any> extends Method {
  call(result: T): Promise<any> | any;
}

export function ToFormMethod<T, FormMethod extends Method<R, P>, R, P>(call: (value: P) => R | Promise<R>): Method<R, P> {
  return { call };
}

/**
 * @deprecated use ToFormMethod instead
 *
 * @param call the call method implementation
 */
export function ToFormSubmitMethod<T>(call: (value: T) => boolean): FormSubmitMethod<T> {
  return ToFormMethod(call);
}
