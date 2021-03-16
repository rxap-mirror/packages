export function CoerceSuffix(str: string, suffix: string, regexp?: RegExp): string {

  if (!str.match(regexp ?? new RegExp(`${suffix}$`))) {
    return str + suffix;
  }

  return str;

}
