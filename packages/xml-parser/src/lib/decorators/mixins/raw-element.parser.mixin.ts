export interface RawElementOptions {
  raw?: boolean;
}

export class RawElementParserMixin {

  public readonly options!: any;

  public get raw(): boolean {
    return !!this.options.raw;
  }

}
