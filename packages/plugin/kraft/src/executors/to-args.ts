export function toArgs(options: any): string[] {
  const args: string[] = [];

  for (const [key,value] of Object.entries(options)) {

    if (Array.isArray(value)) {
      for (const item of value) {
        args.push(`--${key}=${item}`);
      }
    } else {
      args.push(`--${key}=${value}`);
    }

  }

  return args;
}
