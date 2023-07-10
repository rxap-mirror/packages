# How To Do

## Create a new library project

To create a new library project, run the command:

```shell
yarn nx g @nx/js:library
```

After the library is created run the generator to create and update imported packages files:

```shell
yarn nx g @rxap/plugin-library:init --project <project-name>
```

This generate will copy properties from the root package.json and adds the executors `readme`, `update-dependencies`
and `update-package-group` to the project.

To add the executor to generate the typedoc documentation for the library run the command:

```shell
yarn nx g @enio.ai/typedoc:config <project-name>
```

If you want to create a library project for a specific framework or toolset use the generate commands in the following
sections.

### Nx Plugin

To create a new nx plugin package, run the command:

```shell
yarn nx g @nx/plugin:plugin
```

### Angular Library

To create a new angular library package, run the command:

```shell
yarn nx g @nx/angular:library --importPath @rxap/<project-name>
```

To add the executor to generate the compodoc documentation for the library run the command:

```shell
yarn nx g @twittwer/compodoc:config <project-name>
```

To add a secondary entry point to the library run the command:

```shell
nx generate @nx/angular:library-secondary-entry-point --skipModule --library=angular-<project-name> --name=<entry-point>
```

### Nest Library

To create a new nest library package, run the command:

```shell
yarn nx g @nx/nest:library --importPath @rxap/nest-<project-name>
```

### Node Library

### Schematic Library