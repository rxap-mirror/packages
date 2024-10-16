export interface RawElementOptions {
  raw?: boolean;
}

export class RawElementMixin {

  public readonly options!: any;

  public get raw(): boolean {
    return !!this.options.raw;
  }

}
