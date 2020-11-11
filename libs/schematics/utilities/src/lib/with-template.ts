export type StringOrFactory = string | (() => string);

export interface WithTemplate {
  template(...attributes: StringOrFactory[]): string;
}
