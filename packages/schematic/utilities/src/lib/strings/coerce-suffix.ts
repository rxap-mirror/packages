export function CoerceSuffix(input: string, suffix: string, regexp?: RegExp): string {

  if (regexp) {

    if (!input.match(regexp ?? new RegExp(`${suffix}$`))) {
      return input + suffix;
    }

    return input;

  }

  let overlapLength = 0;

  for (let i = 1; i <= Math.min(input.length, suffix.length); i++) {
    const inputSubstring = input.slice(-i);
    const suffixSubstring = suffix.slice(0, i);

    if (inputSubstring === suffixSubstring) {
      overlapLength = i;
    }
  }

  return input + suffix.slice(overlapLength);

}
