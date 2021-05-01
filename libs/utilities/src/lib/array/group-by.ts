export function GroupBy<T, K extends keyof T>(list: T[], propertyKey: K): Map<K, T[]> {
  const map = new Map();

  for (const item of list) {

    const key = item[ propertyKey ];

    if (!map.has(key)) {
      map.set(key, []);
    }

    map.get(key)!.push(item);

  }

  return map;
}
