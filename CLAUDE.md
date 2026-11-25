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

The project uses `pnpm` (version pinned in `package.json#packageManager`, run via corepack) and `nx`. Ensure you have Node >=22 and `corepack enable`.

### Core Commands
- **Install:** `pnpm install`
- **Build All:** `pnpm nx run-many -t build`
- **Build Project:** `pnpm nx run <project-name>:build`
- **Test:** `pnpm nx run <project-name>:test`
- **Lint:** `pnpm nx run <project-name>:lint`
- **Affected:** `pnpm nx affected -t <target>`

### Development Services
The project includes a Docker-based backend infrastructure:
- **Start Services:** `pnpm server`
- **Check Status:** `pnpm server:status`
- **Stop Services:** `pnpm server:stop`

### Initialization & Configuration
- **Setup Environment:** `pnpm init:env`
- **Update RxAP Packages:** `pnpm rxap:update`
- **Run Schematic:** `pnpm schematic <schematic-name>`

## Development Conventions

### Angular
- **Standalone Only:** All new components must be standalone.
- **Reactive Features:** Prefer `signals`, `input()`, `output()`, and `computed()`.
- **Change Detection:** Always set `ChangeDetectionStrategy.OnPush`.
- **Forms:** Prefer Reactive forms. Use `@rxap/forms` for structured form management.
- **Styling:** Use Tailwind CSS with `RXAP_TAILWIND_CONFIG` preset.

### Monorepo Workflow
- **New Library:** `pnpm nx g @nx/js:library` followed by `pnpm nx g @rxap/plugin-library:init --project <name>`.
- **Documentation:** Use `@rxap/plugin-compodoc` for Angular/Nest libraries and `@rxap/plugin-typedoc` for JS/TS libraries.
- **Commits:** Follow **Conventional Commits**. Use `git cz` or the Commitizen-friendly tools.

### Dependency Upgrades (supply-chain rule — IMPORTANT)
- **Never install the newest release.** A version must be public for at least 7 days (>= 1M weekly downloads),
  14 days (>= 100k) or 30 days (less popular / unknown) before it may be used. Check the publish date BEFORE
  changing any version.
- Use `node tools/scripts/dependency-cooldown.mjs` (picks the newest eligible, peer-compatible version and writes
  exact versions), then `node tools/scripts/align-framework-dep-versions.mjs` and
  `node tools/scripts/audit-lockfile-cooldown.mjs <base-ref>` (transitives). Details and the list of packages that
  deliberately stay on an older major: `UPGRADE-NOTES.md` section 4.
- Aim for the highest *compatible* major; `peerDependencies` of published packages are the major (`^22.0.0`),
  never the workspace's minor.
- pnpm enforces a 7-day floor (`minimumReleaseAge`) and `trustPolicy: no-downgrade`. Never lower them or add an
  exclusion without a dated comment (`remove after YYYY-MM-DD`); never `npx`/`pnpm dlx` an unpinned package.
  Run `pnpm supply-chain:check` after every dependency change (the pre-push hook runs it too).
- Renovate (`RENOVATE.md`, `renovate.json5`) runs as a scheduled job of this repo. Never merge a Renovate MR while
  `supply-chain:check` is red; run `pnpm renovate:tiers` after adding a root dependency by hand.

### Code Intelligence
- **Generators:** Consult `pnpm nx list @rxap/plugin-<type>` to see available generators.
- **Project Mapping:** Use `pnpm nx show project <name> --json` to understand project roots and targets.

## Design (FigCraft)
- `packages/angular/angular-components.figcraft`: Angular Material + CDK kit (generated in angular/components, linked as a library).
- `packages/angular/rxap.figcraft`: every rxap Angular component and directive, one page per library, named by selector.
  **Generated** from the ng-prism styleguides with `pnpm figcraft` — never edit by hand; see `tools/figcraft/README.md`.

## Key Files
- `nx.json`: Core monorepo configuration and target defaults.
- `package.json`: Root dependencies and project-wide scripts.
- `DEVELOPMENT.md`: Detailed setup instructions.
- `HOW_TO_DO.md`: Step-by-step guides for common development tasks.
- `schematics.yaml`: Configuration for the schematic composer.

## Working in this Nx Workspace

You are operating in an Nx workspace. Access the Nx CLI with `pnpm nx <command>`. To get a list of available commands run `pnpm nx --help`. Always use the `--help` flag to get detailed information about possible flags and subcommands, e.g. `pnpm nx run-many --help`.

Notable commands you will use often:
- `pnpm nx affected`: Run a target for affected projects.
- `pnpm nx generate <generator>`: Generate or update source code (e.g. `pnpm nx generate @nx/js:lib mylib`).
- `pnpm nx list [plugin]`: List installed plugins and their capabilities.
- `pnpm nx run [project][:target][:configuration]`: Run a target for a project.
- `pnpm nx run-many`: Run a target for multiple listed projects.
- `pnpm nx show`: Show information about the workspace (e.g. list of projects).

Common usages:
- Run target "build" for project "backend": `pnpm nx run backend:build`
- Run target "test" for all projects: `pnpm nx run-many -t test`
- Run target "build" for all affected projects: `pnpm nx affected -t build`
- Run "test" for projects affected by specific files: `pnpm nx affected -t test --files api/backend/src/app/app.controller.ts`
- List all installed plugins: `pnpm nx list`
- List generators offered by `@rxap/plugin-angular`: `pnpm nx list @rxap/plugin-angular`
- List options of a generator: `pnpm nx generate @rxap/plugin-nestjs:init-library --help`
- Run a generator for a project: `pnpm nx generate @rxap/plugin-nestjs:init-library --project api-app-config`
- List all projects: `pnpm nx show projects`
- Show project configuration: `pnpm nx show project api-profile --json`
- List targets for a project: `pnpm nx show project api-profile --json | jq -r '.targets | keys[]'`
- Get the project root: `pnpm nx show project api-profile --json | jq -r '.root'`
- Get the project for a specific file: `pnpm nx show projects --affected --files <file> | head -n 1`

## Tooling & MCP Integration

The project ships an `.mcp.json` with several MCP servers (Nx, Chrome DevTools, Playwright, Context7, DeepWiki, Figma, memory, node-code-sandbox). They are auto-enabled via `.claude/settings.json` (`enableAllProjectMcpServers`). Remote servers (Figma) may require auth via `/mcp` on first use; `context7` needs `CONTEXT7_API_KEY` in the environment.

### Tool routing rules (IMPORTANT — follow by default)

**Strong default:** When an Nx or WebStorm MCP tool fits the task, use it instead of re-deriving the answer with `Bash`/`Read`/`Grep`. Fall back to built-ins only when no MCP tool covers the need. Do not parse Nx config or compute the project graph by hand when an MCP tool returns it directly.

**Use the Nx MCP server for:**
- Workspace/project info → `nx_workspace`, `nx_project_details` (instead of `pnpm nx show project ... --json | jq`).
- Project & task dependency graphs, affected analysis → Nx MCP graph tools (instead of hand-tracing imports).
- Discovering/scaffolding code → `nx_generators` + `nx_generator_schema` + `nx_run_generator` (instead of guessing generator names/flags).
- Nx configuration, options, and best practices → `nx_docs` (never answer Nx config questions from memory — docs may be outdated).
- CI / Nx Cloud pipeline analysis and self-healing → the corresponding Nx Cloud MCP tools.

**Use the WebStorm MCP server for:**
- Validating edits → `build_project` / `get_file_problems` for IDE inspections and compile errors (preferred over a blind `nx build` when you only need diagnostics for specific files).
- Symbol navigation & semantics → `search_symbol`, `get_symbol_info`, `find_files_by_name_keyword`.
- Refactors → `rename_refactoring` for safe project-wide renames (instead of `Grep` + manual `Edit` sweeps).
- Formatting → `reformat_file` after edits.
- Database work → `list_database_connections`, `execute_sql_query`, schema/table inspection tools.

**Keep using built-ins for:**
- `Read`, `Edit`, `Write`, `Grep`, `Glob` for plain file reads, edits, and text/pattern searches.
- `Bash` for running `nx`/`pnpm` targets (build/test/lint/serve), git, and general terminal tasks. Run long-running tasks (like `nx serve`) in the background.

**Library/framework docs:** use the `context7` MCP server (resolve-library-id → query-docs) before answering API/config/version questions, even for well-known libraries.
