export interface SortableObject {
  enabled: boolean;
  default?: {
    active?: string;
    direction?: 'asc' | 'desc';
  }
}

export type Sortable = boolean | SortableObject;

export interface NormalizedSortable {
  enabled: boolean;
  default: {
    active: string | null;
    direction: 'asc' | 'desc' | null;
  } | null;
}

export function NormalizeSortable(sortable?: Sortable): NormalizedSortable {
  if (!sortable) {
    return {
      enabled: false,
      default: null,
    };
  }
  if (typeof sortable === 'boolean') {
    return {
      enabled: sortable,
      default: null,
    };
  }
  return {
    enabled: sortable.enabled,
    default: sortable.default ? {
      active: sortable.default.active ?? null,
      direction: sortable.default.direction ?? null,
    } : null,
  };
}
