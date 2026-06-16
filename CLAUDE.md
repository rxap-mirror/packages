# RxAP - Reactive Application Platform

RxAP is a collection of software modules and tools designed to significantly reduce the development effort of web and cloud applications. It is organized as a high-performance **Nx monorepo**.

## Project Overview

- **Architecture:** Monorepo managed with **Nx** and **Lerna**.
- **Frontend Stack:** **Angular 19+** (Standalone Components, Signals, `OnPush` change detection), **Angular Material**, **Tailwind CSS**.
- **Backend Stack:** **NestJS 11+**, **Node.js 22+**.
- **Testing:** **Jest** for unit/integration tests, **Cypress** for component/E2E testing.
- **Infrastructure:** RabbitMQ (CQRS), Minio (S3 storage), Auth0/Keycloak (OIDC), Supabase, Firebase, Web3.Storage.
- **Code Generation:** Custom Nx plugins (`@rxap/plugin-*`) and schematics (`@rxap/schematic-*`).

## Workspace Structure

- `packages/`: All library packages, categorized by framework/toolset (angular, nest, node, n8n, plugin, schematic, etc.).
- `demos/`: Application demonstrations.
- `shared/`: Shared infrastructure code (Angular, NestJS, services).
- `tools/`: Workspace-level scripts and configuration helpers.
- `.claude/skills/`: Custom Agent Skills for standardizing workflows.
- `.claude/commands/`: Custom slash commands (e.g. `/update-generator-documentation`).

## Building and Running

The project uses `yarn` and `nx`. Ensure you have Node >=22 and Yarn >=3.6.

### Core Commands
- **Install:** `yarn`
- **Build All:** `yarn nx run-many -t build`
- **Build Project:** `yarn nx run <project-name>:build`
- **Test:** `yarn nx run <project-name>:test`
- **Lint:** `yarn nx run <project-name>:lint`
- **Affected:** `yarn nx affected -t <target>`

### Development Services
The project includes a Docker-based backend infrastructure:
- **Start Services:** `yarn server`
- **Check Status:** `yarn server:status`
- **Stop Services:** `yarn server:stop`

### Initialization & Configuration
- **Setup Environment:** `yarn init:env`
- **Update RxAP Packages:** `yarn rxap:update`
- **Run Schematic:** `yarn schematic <schematic-name>`

## Development Conventions

### Angular
- **Standalone Only:** All new components must be standalone.
- **Reactive Features:** Prefer `signals`, `input()`, `output()`, and `computed()`.
- **Change Detection:** Always set `ChangeDetectionStrategy.OnPush`.
- **Forms:** Prefer Reactive forms. Use `@rxap/forms` for structured form management.
- **Styling:** Use Tailwind CSS with `RXAP_TAILWIND_CONFIG` preset.

### Monorepo Workflow
- **New Library:** `yarn nx g @nx/js:library` followed by `yarn nx g @rxap/plugin-library:init --project <name>`.
- **Documentation:** Use `@rxap/plugin-compodoc` for Angular/Nest libraries and `@rxap/plugin-typedoc` for JS/TS libraries.
- **Commits:** Follow **Conventional Commits**. Use `git cz` or the Commitizen-friendly tools.

### Code Intelligence
- **Generators:** Consult `yarn nx list @rxap/plugin-<type>` to see available generators.
- **Project Mapping:** Use `yarn nx show project <name> --json` to understand project roots and targets.

## Key Files
- `nx.json`: Core monorepo configuration and target defaults.
- `package.json`: Root dependencies and project-wide scripts.
- `DEVELOPMENT.md`: Detailed setup instructions.
- `HOW_TO_DO.md`: Step-by-step guides for common development tasks.
- `schematics.yaml`: Configuration for the schematic composer.

## Working in this Nx Workspace

You are operating in an Nx workspace. Access the Nx CLI with `yarn nx <command>`. To get a list of available commands run `yarn nx --help`. Always use the `--help` flag to get detailed information about possible flags and subcommands, e.g. `yarn nx run-many --help`.

Notable commands you will use often:
- `yarn nx affected`: Run a target for affected projects.
- `yarn nx generate <generator>`: Generate or update source code (e.g. `yarn nx generate @nx/js:lib mylib`).
- `yarn nx list [plugin]`: List installed plugins and their capabilities.
- `yarn nx run [project][:target][:configuration]`: Run a target for a project.
- `yarn nx run-many`: Run a target for multiple listed projects.
- `yarn nx show`: Show information about the workspace (e.g. list of projects).

Common usages:
- Run target "build" for project "backend": `yarn nx run backend:build`
- Run target "test" for all projects: `yarn nx run-many -t test`
- Run target "build" for all affected projects: `yarn nx affected -t build`
- Run "test" for projects affected by specific files: `yarn nx affected -t test --files api/backend/src/app/app.controller.ts`
- List all installed plugins: `yarn nx list`
- List generators offered by `@rxap/plugin-angular`: `yarn nx list @rxap/plugin-angular`
- List options of a generator: `yarn nx generate @rxap/plugin-nestjs:init-library --help`
- Run a generator for a project: `yarn nx generate @rxap/plugin-nestjs:init-library --project api-app-config`
- List all projects: `yarn nx show projects`
- Show project configuration: `yarn nx show project api-profile --json`
- List targets for a project: `yarn nx show project api-profile --json | jq -r '.targets | keys[]'`
- Get the project root: `yarn nx show project api-profile --json | jq -r '.root'`
- Get the project for a specific file: `yarn nx show projects --affected --files <file> | head -n 1`

## Tooling & MCP Integration

The project ships an `.mcp.json` with several MCP servers (Nx, Chrome DevTools, Playwright, Context7, DeepWiki, Figma, memory, node-code-sandbox). They are auto-enabled via `.claude/settings.json` (`enableAllProjectMcpServers`). Remote servers (Figma) may require auth via `/mcp` on first use; `context7` needs `CONTEXT7_API_KEY` in the environment.

- **Nx MCP:** Prefer the Nx MCP tools for up-to-date Nx configuration, project graph queries, and best practices over re-deriving them by hand.
- **File operations:** Use the built-in `Read`, `Edit`, `Write`, `Grep`, and `Glob` tools for file interactions rather than shelling out to `cat`/`sed`.
- **Shell commands:** Use `Bash` for `nx`/`yarn` commands and general terminal tasks. For long-running tasks (like `nx serve`), run them in the background.
