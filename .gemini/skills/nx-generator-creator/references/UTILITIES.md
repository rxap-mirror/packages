# Utilities Reference

This document lists key utility functions available for creating Nx generators, organized by package.

## @rxap/workspace-utilities

General workspace and file system utilities.

### File Operations
- `GetJsonFile(tree, path)`: Reads a JSON file.
- `UpdateJsonFile(tree, updater, path)`: Updates a JSON file.
- `UpdatePackageJson(tree, updater, options)`: Updates `package.json`.
- `AddPackageJsonDependency(tree, packageName, version, options)`: Adds a dependency to `package.json`.
- `AddPackageJsonDevDependency(tree, packageName, version, options)`: Adds a dev dependency to `package.json`.
- `CoerceFile(tree, path, content)`: Creates or overwrites a file.

### Project Information
- `GetProject(tree, projectName)`: Gets project configuration.
- `GetProjectRoot(tree, projectName)`: Gets project root path.
- `GetProjectSourceRoot(tree, projectName)`: Gets project source root path.
- `HasProject(tree, projectName)`: Checks if a project exists.
- `IsLibraryProject(project)`: Checks if a project is a library.
- `IsApplicationProject(project)`: Checks if a project is an application.

## @rxap/workspace-ts-morph

Utilities for transforming TypeScript files within an Nx workspace using `ts-morph`.

### Transforms
- `TsMorphNestProjectTransform(tree, options, callback, filePaths)`: Transforms NestJS project files.
  - `options`: `{ project: string, backend: { ... } }`
  - `callback`: `(project: Project, sourceFile: SourceFile[]) => void`
- `TsMorphAngularProjectTransform(tree, options, callback, filePaths)`: Transforms Angular project files.
  - `options`: `{ project: string }`
  - `callback`: `(project: Project, sourceFile: SourceFile[]) => void`
- `TsMorphProjectTransform(tree, options, callback, filePaths)`: General project transform.

## @rxap/ts-morph

Low-level `ts-morph` utilities for manipulating AST nodes.

### General
- `CoerceClass(sourceFile, name, structure)`: Ensures a class exists.
- `CoerceDecorator(node, name, structure)`: Ensures a decorator exists.
- `CoerceImports(sourceFile, imports)`: Adds imports.
- `CoercePropertyDeclaration(classDecl, name, structure)`: Ensures a property exists.
- `CoerceClassMethod(classDecl, name, structure)`: Ensures a method exists.

### NestJS Specific
- `CoerceNestModule(sourceFile, options)`: Ensures a NestJS module exists.
- `CoerceNestController(sourceFile, options)`: Ensures a NestJS controller exists.
- `CoerceNestModuleProvider(sourceFile, options)`: Adds a provider to a module.
- `CoerceNestModuleImport(sourceFile, options)`: Imports a module into a NestJS module.
- `CoerceNestModuleController(sourceFile, options)`: Adds a controller to a module.

### Angular Specific
- `CoerceComponent(sourceFile, name, options)`: Ensures an Angular component exists.
- `CoerceAppRoutes(sourceFile, options)`: Configures app routes.
- `AddRoute(sourceFile, options)`: Adds a route to a routes array.
