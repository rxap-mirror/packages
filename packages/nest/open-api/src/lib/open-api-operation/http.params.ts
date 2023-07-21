import { HttpParamType } from './types';

export class HttpParams {

  private readonly params = new Map<string, HttpParamType>();

  public static ToHttpQueryString(params: Record<string, HttpParamType> = {}): string {
    if (!Object.keys(params).length) {
      return '';
    }
    const httpParams = new HttpParams();
    for (const [ key, value ] of Object.entries(params)) {
      httpParams.set(key, value);
    }
    return '?' + httpParams.toString();
  }

  set(key: string, value: HttpParamType) {
    this.params.set(key, value);
  }

  has(key: string) {
    return this.params.has(key);
  }

  append(key: string, value: HttpParamType) {
    if (this.params.has(key)) {
      const currentValue = this.params.get(key)!;
      let newValue: HttpParamType;
      if (Array.isArray(currentValue)) {
        newValue = currentValue.slice();
        if (Array.isArray(value)) {
          newValue.push(...value);
        } else {
          newValue.push(value);
        }
      } else {
        if (Array.isArray(value)) {
          newValue = [ currentValue, ...value ];
        } else {
          newValue = [ currentValue, value ];
        }
      }
      newValue = newValue.filter((v, i, a) => a.indexOf(v) === i);
      this.params.set(key, newValue);
    } else {
      this.set(key, value);
    }
  }

  toString() {
    const paramList: string[] = [];

    for (const [ key, value ] of this.params.entries()) {
      if (Array.isArray(value)) {
        for (const v of value) {
          paramList.push(`${ key }=${ encodeURIComponent(v) }`);
        }
      } else {
        paramList.push(`${ key }=${ encodeURIComponent(value) }`);
      }
    }

    return paramList.join('&');
  }

}
