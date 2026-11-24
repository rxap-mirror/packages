How to develop with the project
===

# Imported nx cli commands

| command | description |
| --- | --- |

# Get started

1. Ensure the node version >=22 is installed and available `node -v`
2. Enable corepack: `corepack enable` (Node >= 25 no longer bundles it: `npm install -g corepack` first)
3. Install the project dependencies by running `pnpm install` in the project root directory (corepack runs the pnpm
   version pinned in `package.json#packageManager`)
4. Check if everything is compilable with: `pnpm nx run-many --target build`

## Install node and npm

1. Install the Node Version Manager - https://github.com/nvm-sh/nvm#install--update-script
2. Verify the installation - https://github.com/nvm-sh/nvm#verify-installation
3. Install node version >=22 with: `nvm install 22`
4. Ensure the node version >=22 is installed and available `node -v`

## Install pnpm

1. Enable the node corepack: `corepack enable`
2. Run `pnpm --version` in the project root: corepack downloads the version pinned in `package.json#packageManager`

## JetBrains Webstorm

Recommended plugins:

- [Conventional Commit](https://plugins.jetbrains.com/plugin/13389-conventional-commit)
- [Nx Console](https://plugins.jetbrains.com/plugin/21060-nx-console)

## Visual Studio Code

Recommended Extensions:

- [Nx Console](https://marketplace.visualstudio.com/items?itemName=nrwl.angular-console)
- [npm](https://marketplace.visualstudio.com/items?itemName=eg2.vscode-npm-script)
- [Jest](https://marketplace.visualstudio.com/items?itemName=Orta.vscode-jest)

# Startup

1. run `pnpm server` to start the backend
2. run `nx run angular:serve` to start the frontend
3. if authentik is not setup follow the instructions in the authentik setup section

## Authentik Setup

To access the admin dashboard navigate to http://localhost:9000/ and use the username `akadmin`. The password is stored
in the environment variable `AUTHENTIK_BOOTSTRAP_PASSWORD`.
