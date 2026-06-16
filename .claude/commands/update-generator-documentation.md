---
description: Update the generator documentation
argument-hint: <project-name>
---

Your goal is to update the generator documentation to be specific to the `description` properties in the `schema.json` for a generator.

The project to update is: $ARGUMENTS

The Generator `schema.json` is located at: `<project-root>/src/generators/<generator-name>/schema.json`.
The main entrypoint for a generator is the file `<project-root>/src/generators/<generator-name>/generator.ts`.
To generalise the implementation of generators we have created multiple utilities projects that contain shared implementation that solve common problems:
- plugin-utilities: `packages/plugin/utilities`
- workspace-utilities: `packages/workspace/utilities`
- workspace-ts-morph: `packages/workspace/ts-morph`
- ts-morph: `packages/ts-morph`

For TypeScript AST transformation we are using the ts-morph package. In the projects `workspace-ts-morph` and `ts-morph` we have introduced a collection of utility functions to simplify the use of ts-morph.

Your task is now to update the generator documentation of the given project. You should:
1. Iterate over each generator.
2. Analyse what the generator does.
3. Look into how the options for the generator are used.
4. Update the `description` and/or `examples` field for each option in the `schema.json` file.
