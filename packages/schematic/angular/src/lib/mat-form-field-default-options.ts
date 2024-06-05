export enum MatFormFieldAppearance {
  Legacy = 'legacy',
  Standard = 'standard',
  Fill = 'fill',
  Outline = 'outline',
}

export interface MatFormFieldDefaultOptions {
  appearance?: MatFormFieldAppearance;
}

export interface NormalizedMatFormFieldDefaultOptions {
  appearance: MatFormFieldAppearance | undefined;
}

export function NormalizeMatFormFieldDefaultOptions(
  options?: Readonly<MatFormFieldDefaultOptions>,
): Readonly<NormalizedMatFormFieldDefaultOptions> | null {
  return options && Object.keys(options).length ? Object.freeze({
    appearance: options.appearance,
  }) : null;
}
