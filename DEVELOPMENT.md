How to develop with the project
===

# Imported nx cli commands

| command | description |
| --- | --- |

# Get started

1. Ensure the node version >=18.17.x <19 is installed and available `node -v`
2. Ensure the npm version >=9.5.x is installed and available `npm -v`
3. Ensure the yarn version >=3.6.x is installed and available `yarn -v`
4. Install the project npm dependencies by running `yarn` in the project root directory
5. Check if everything is compilable with: `nx run-many --target build`

## Install node and npm

1. Install the Node Version Manager - https://github.com/nvm-sh/nvm#install--update-script
2. Verify the installation - https://github.com/nvm-sh/nvm#verify-installation
3. Install node version >=18.17.x with: `nvm install lts/hydrogen`
4. Ensure the node version >=18.17.x is installed and available `node -v`
5. Ensure the npm version >=9.5.x is installed and available `npm -v`

## Install yarn

1. Enable the node corepack: `corepack enable`
2. Install yarn version >=3.6.x with: `corepack prepare yarn@stable --activate`
3. Ensure the yarn version >=3.6.x is installed and available `yarn -v`

## JetBrains Webstorm

Recommended plugins:

- [Conventional Commit](https://plugins.jetbrains.com/plugin/13389-conventional-commit)
- [Nx Console](https://plugins.jetbrains.com/plugin/21060-nx-console)

## Visual Studio Code

Recommended Extensions:

- [Nx Console](https://marketplace.visualstudio.com/items?itemName=nrwl.angular-console)
- [npm](https://marketplace.visualstudio.com/items?itemName=eg2.vscode-npm-script)
- [Jest](https://marketplace.visualstudio.com/items?itemName=Orta.vscode-jest)
