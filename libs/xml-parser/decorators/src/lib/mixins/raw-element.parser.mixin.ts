export interface RawElementOptions {
  raw?: boolean;
}

export class RawElementParserMixin {

  public get raw(): boolean {
    return !!this.options.raw;
  }

  public readonly options!: any;

}
