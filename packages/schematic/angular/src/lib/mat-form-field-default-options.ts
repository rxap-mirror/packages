export interface MatFormFieldDefaultOptions {
  appearance?: 'legacy' | 'standard' | 'fill' | 'outline';
}

export interface NormalizedMatFormFieldDefaultOptions {
  appearance: 'legacy' | 'standard' | 'fill' | 'outline' | undefined;
}

export function NormalizeMatFormFieldDefaultOptions(
  options?: Readonly<MatFormFieldDefaultOptions>,
): Readonly<NormalizedMatFormFieldDefaultOptions> | null {
  return options && Object.keys(options).length ? Object.freeze({
    appearance: options.appearance,
  }) : null;
}
