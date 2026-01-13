# Backend Configuration Guide

The `backend` property defines how the table component retrieves data and whether a backend controller should be generated.

## Backend Kinds

| Kind | Description |
| :--- | :--- |
| `none` | No backend integration. Uses mock data (default). |
| `nestjs` | Generates a NestJS controller and connects the table to it. |
| `open-api` | Connects the table to an existing OpenAPI-generated client. |
| `local` | Uses local data (static or from a local service). |
| `data-source` | Uses a custom data source implementation. |

## NestJS Backend

When using `kind: nestjs`, the schematic will generate a controller in the specified `nestModule`.

```yaml
backend:
  kind: nestjs
  project: api-app # Optional: Backend project name
nestModule: api-user
```

### Generated Controller
The generated controller will include a `getPage` method that handles:
- Pagination
- Sorting
- Filtering

## OpenAPI Backend

When using `kind: open-api`, you must specify the `operationId` of the API endpoint.

```yaml
backend:
  kind: open-api
  serverId: main # Optional: Server ID from OpenAPI spec
openApi:
  operationId: listUsers
```

## Global Backend Options

| Property | Type | Description |
| :--- | :--- | :--- |
| `project` | `string` | The target project for the backend code. |
| `serverId` | `string` | The OpenAPI server ID to use. |
