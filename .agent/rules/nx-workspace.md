---
trigger: always_on
---

You are operating in a nx workspace. You can access the nx cli with `yarn nx <command>`. To get a list of avialbe commands run `yarn nx --help`.

Some notable commands that you will use often:
- `yarn nx affected`: Run target for affected projects.
- `yarn nx generate <generator>`: Generate or update source code (e.g., nx generate @nx/js:lib mylib)
- `yarn nx list [plugin]`: Lists installed plugins, capabilities of installed plugins and other available plugins.
- `yarn nx run [project][:target][:configuration]`: Run a target for a project
- `yarn nx run-many`: Run target for multiple listed projects.
- `yarn nx show`: Show information about the workspace (e.g., list of projects).
- `yarn nx view-logs`: Enables you to view and interact with the logs via the advanced analytic UI from Nx Cloud to help you debug your issue

You can always use the `--help` flag to get detailed information about possible flags and subcommands e.g.: `yarn nx run-many --help`

## Notable usages of the nx cli

- Run the target "build" for the project "backend": `yarn nx run backend:build`
- Run the target "test" for all projects: `yarn nx run-many -t test`
- Run the target "build" for all projects with the tag "application": `yarn nx run-many -t test -p tag:application`
- Run the target "build" for all projects that are affected by the currently changed files: `yarn nx affected -t build`
- Run the target "test" for all projects that are affected by the a specific file: `yarn nx affected -t test --files api/backend/src/app/app.controller.ts,api/backend/src/app/app.config.ts`
- List all installed nx workspace plugins: `yarn nx list`
- List all generators that the plugin "@rxap/plugin-angular" offers: `yarn nx list @rxap/plugin-angular`
- List all options a the generator "init-library" of the plugin "@rxap/plugin-nestjs" supports: `yarn nx generate @rxap/plugin-nestjs:init-library --help`
- Executes the generator "init-library" of the plugin "@rxap/plugin-nestjs" for the project "api-app-config": `yarn nx generate @rxap/plugin-nestjs:init-library --project api-app-config`
- List all the available project in the workspace: `yarn nx show projects`
- Show the project configuration for the project `api-profile`: `yarn nx show project api-profile --json`
- List the available targets for the project `api-profile`: `yarn nx show project api-profile --json  | jq -r '.targets | keys[]'`
- Get project root of the project `api-profile`: `yarn nx show project api-profile --json  | jq -r '.root'`
- Get the project for a specific file: `yarn nx show projects --affected --files api/feature/portal/src/lib/portal.controller.ts | head -n 1`
