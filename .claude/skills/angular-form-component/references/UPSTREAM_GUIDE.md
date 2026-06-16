# Upstream Data Guide

The `upstream` property is used for advanced data source configurations, particularly when working with complex APIs or mapping structures.

## Upstream Kinds

Currently, the primary kind supported is `open-api`.

```yaml
upstream:
  kind: open-api
  operationId: getUsers
  scope: admin
  mapper:
    kind: paged
    pageIndex: offset
    pageSize: limit
```

## Configuration Properties

| Property | Type | Description |
| :--- | :--- | :--- |
| `kind` | `string` | The type of upstream source (e.g., `open-api`). |
| `operationId` | `string` | The API operation ID. |
| `scope` | `string` | (Optional) A scope indicator for the data. |
| `mapper` | `object` | Defines how API parameters map to table pagination/sorting. |

## Mapper Kinds

### `paged`
Maps pagination, sorting, and filtering parameters.

- `pageIndex`: Name of the page index parameter (e.g., `page`).
- `pageSize`: Name of the page size parameter (e.g., `limit`).
- `sortBy`: Name of the sort field parameter.
- `sortDirection`: Name of the sort direction parameter.
- `list`: Path to the data list in the response.
- `total`: Path to the total count in the response.

### `options`
Maps data to an options structure (label/value pairs).

- `toFunction`: Conversion function (`ToOptions`, `ToOptionsFromObject`).
- `toValue`: Field to use as value.
- `toDisplay`: Field to use as label.

### `resolve`
Resolves a specific value from the upstream source.
