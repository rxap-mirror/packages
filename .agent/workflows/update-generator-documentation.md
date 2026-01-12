---
description: Update the generator documentation
---

Your goal is it to update the generator documentation to be specific the `description` properties in the `schema.json` for a generator.

The Generator `schema.json` is located: `<project-root>/src/generators/<generator-name>/schema.json`.
The main entrypoint for an generator is the file `<project-root>/src/generators/<generator-name>/generator.ts`.
To generalise the implementation of generators we have created multiple utilities project that contain shared implementation that solve commen problems:
- plugin-utilities: `packages/plugin/utilities`
- workspace-utilities: `packages/workspace/utilities`
- workspace-ts-morph: `packages/workspace/ts-morph`
- ts-morph: `packages/ts-morph`

For typescript AST transformation we are using the ts-morph package. And in the projects `workspace-ts-morph` and `ts-morph` we have introduce a collection of utility function to simplfy the use of ts-moprh.

You task is now to update the generator documentation of the given project.
You should iterate over each generator
Then you should analyse what the generator does
Then you should look into how the options for the generator are used
Then you should update the `description` and or `examples` filed for the option in the `schame.json` file