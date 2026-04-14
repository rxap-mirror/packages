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
- `.gemini/skills/`: Custom Gemini agent skills for standardizing workflows.
- `.agent/`: Workspace-specific agent rules and automated workflows.

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

## Tooling & MCP Integration

### 1. General Principles
- **Prefer Specialized Tools**: Always prefer using specific MCP tools (WebStorm, Nx) over generic `run_shell_command` whenever possible.
- **Project Path**: When using WebStorm MCP tools, always provide the `projectPath` to reduce ambiguity.

### 2. WebStorm Integration
- **Run Configurations**: Before executing `nx` or `npm` commands via terminal, check if WebStorm offers a corresponding run configuration using `mcp_webstorm_get_run_configurations`. If it exists, use `mcp_webstorm_execute_run_configuration`.
- **Terminal Commands**: Use `mcp_webstorm_execute_terminal_command` for general terminal tasks.
- **Background Tasks**: The `mcp_webstorm_execute_run_configuration` tool is primarily intended for "run once" commands. To use it for background tasks (like `nx serve`), set the `timeout` to a very high number.
- **File Operations**: Use `mcp_webstorm_list_directory_tree`, `mcp_webstorm_get_file_text_by_path`, and `mcp_webstorm_replace_text_in_file` for fast IDE-powered file interactions.

### 3. Nx Integration
- **Documentation**: Use `mcp_nx_nx_docs` for up-to-date Nx configuration and best practices.
