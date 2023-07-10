export interface Budget {
  /** The type of budget. */
  type: 'all' | 'allScript' | 'any' | 'anyScript' | 'anyComponentStyle' | 'bundle' | 'initial';
  /** The name of the bundle. */
  name?: string;
  /** The baseline size for comparison. */
  baseline?: string;
  /** The maximum threshold for warning relative to the baseline. */
  maximumWarning?: string;
  /** The maximum threshold for error relative to the baseline. */
  maximumError?: string;
  /** The minimum threshold for warning relative to the baseline. */
  minimumWarning?: string;
  /** The minimum threshold for error relative to the baseline. */
  minimumError?: string;
  /** The threshold for warning relative to the baseline (min & max). */
  warning?: string;
  /** The threshold for error relative to the baseline (min & max). */
  error?: string;
}
