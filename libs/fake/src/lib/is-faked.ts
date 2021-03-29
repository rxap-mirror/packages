export class FakedStatus {

  private static fakeStatusMap: Record<string, any> | boolean = true;

  public static IsFaked(identifier: string): boolean {

    function isFaked(paths: string[], map: Record<string, any> | boolean): boolean {

      if (typeof map === 'boolean') {
        return map;
      }

      const root = paths.shift();

      if (!root) {
        return false;
      }

      // eslint-disable-next-line no-prototype-builtins
      if (map.hasOwnProperty(root)) {
        return isFaked(paths, map[ root ]);
      }

      return false;
    }

    return isFaked(identifier.split('.'), this.fakeStatusMap);
  }

  public static SetFakeStatus(map: Record<string, any> | boolean): void {
    this.fakeStatusMap = map;
  }

}

export const IsFaked = FakedStatus.IsFaked.bind(FakedStatus);
