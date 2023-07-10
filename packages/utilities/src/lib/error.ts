import { Deprecated } from './decorators/deprecated';

export class RxapError extends Error {

  constructor(
    protected _packageName: string,
    message: string,
    public readonly code?: string,
    public readonly scope?: string,
    public override readonly stack?: string,
  ) {
    super(message);
    if ((Error as any)['captureStackTrace']) {
      (Error as any)['captureStackTrace'](this, RxapError);
    }
    this.name = 'RxapError';
  }

  public get packageName(): string {
    return this._packageName;
  }

  public get className(): string | undefined {
    return this.scope;
  }

  public toJSON(): object {
    return {
      package: this.packageName,
      message: this.message,
      code: this.code,
      scope: this.scope,
      className: this.scope,
      stack: this.stack,
    };
  }

  /**
   * Add's the sub package name to the current package name.
   *
   * current package name -> with sub package name
   * @rxap/package -> @rxap/package/sub
   *
   * @internal
   * @param subPackageName The sub package name
   * @deprecated use addSubPackageName instead
   */
  @Deprecated('use addSubPackageName instead')
  protected setSubPackageName(subPackageName: string) {
    this.addSubPackageName(subPackageName);
  }

  /**
   * Add's the sub package name to the current package name.
   *
   * current package name -> with sub package name
   * @rxap/package -> @rxap/package/sub
   *
   * @internal
   * @param subPackageName The sub package name
   * @deprecated removed
   */
  @Deprecated('removed')
  protected addSubPackageName(subPackageName: string) {
    this._packageName = [this._packageName, subPackageName].join('/');
  }

  /**
   * Sets the package name
   *
   * @internal
   * @param packageName The new package name
   */
  protected setPackageName(packageName: string) {
    this._packageName = packageName;
  }

}

export class RxapUtilitiesError extends RxapError {

  constructor(message: string, code: string, className?: string, stack?: string) {
    super('@rxap/utilities', message, code, className, stack);
  }

}
