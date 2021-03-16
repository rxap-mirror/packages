export function CoerceSuffix(str: string, suffix: string): string {

  if (!str.match(new RegExp(`${suffix}$`))) {
    return str + suffix;
  }

  return str;

}
