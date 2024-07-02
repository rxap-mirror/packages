export enum ThemeDensity {
  Normal = 0,
  Compact = -1,
  Dense = -2,
  VeryDense = -3,
}

export function IsThemeDensity(value: any): value is ThemeDensity {
  return Object.values(ThemeDensity).includes(value);
}
