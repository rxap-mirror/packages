@rxap/plugin-app-engine
=========

RxAP App Engine Nrwl Plugin

[![Version](https://img.shields.io/npm/v/@rxap/plugin-app-engine.svg)](https://npmjs.org/package/@rxap/plugin-app-engine)
[![Downloads/week](https://img.shields.io/npm/dw/@rxap/plugin-app-engine.svg)](https://npmjs.org/package/@rxap/plugin-app-engine)
[![License](https://img.shields.io/npm/l/@rxap/plugin-app-engine.svg)](https://gitlab.com/rxap/packages/app-engine/-/blob/master/LICENSE)
[![pipeline status](https://gitlab.com/rxap/packages/app-engine/badges/master/pipeline.svg)](https://gitlab.com/rxap/packages/app-engine/-/commits/master)
[![coverage report](https://gitlab.com/rxap/packages/app-engine/badges/master/coverage.svg)](https://gitlab.com/rxap/packages/app-engine/-/commits/master)

# Installation

### npm

```sh-session
$ npm install --save-dev @rxap/plugin-app-engine
```

### yarn

```sh-session
$ yarn add -D @rxap/plugin-app-engine
```

# Usage

### Schematics

##### Add `app-engine-deploy` target to project

```sh-session
$ nx g @rxap/plugin-app-engine:add [project-name] [service-name]
```

This schematics adds a `app.yaml` config to the project source.

###### `/apps/[project-name]/src/app.yaml`

```yaml
service: [service-name]
runtime: nodejs10

handlers:
- url: /
  static_files: index.html
  upload: index.html
- url: /(.+\..+)$
  static_files: \1
  upload: (.+\..+)
- url: /assets/(.*)
  static_files: assets/\1
  upload: assets/(.*)
- url: (.*)
  static_files: index.html
  upload: index.html
```

And adds the `app-engine-deploy` target to the `angular.json` or `workspace.json`.

###### `/angular.json` or `workspace.json`

```json
{
  "projects": {
    "[project-name]": {
      "architect": {
        "app-engine-deploy": {
          "builder": "@rxap/plugin-app-engine:deploy"
        }
      }
    }
  }
}
```

### Builder

##### Build and deploy app to gcp app engine

```sh-session
$ nx run [project-name]:app-engine-deploy
```

#### Builder config options

###### `schema.json`

```json
{
  "$schema": "https://json-schema.org/draft-07/schema",
  "$id": "https://json-schema.org/draft-07/schema",
  "title": "AppEngine Deploy builder",
  "description": "",
  "type": "object",
  "properties": {
    "skipBuild": {
      "type": "boolean",
      "description": "Weather the app target build should be executed before deployment.",
      "alias": "skip-build"
    },
    "project": {
      "type": "string",
      "description": "The Google Cloud Platform project name to use for this invocation. If\nomitted, then the current project is assumed"
    },
    "promote": {
      "type": "boolean",
      "description": "Promote the deployed version to receive all traffic. Overrides the\ndefault app/promote_by_default property value for this command\ninvocation. Use --no-promote to disable."
    },
    "noPromote": {
      "type": "boolean",
      "description": "Not promote the deployed version to receive all traffic.",
      "alias": "no-promote"
    },
    "stopPreviousVersion": {
      "type": "boolean",
      "description": "Stop the previously running version when deploying a new version that\nreceives all traffic.",
      "alias": "stop-previous-version"
    },
    "version": {
      "type": "boolean",
      "description": "The version of the app that will be created or replaced by this\ndeployment. If you do not specify a version, one will be generated for\nyou."
    }
  }
}
```

##### Example

###### `angular.json` or `workspace.json`

```json
{
  "projects": {
    "[project-name]": {
      "architect": {
        "app-engine-deploy": {
          "builder": "@rxap/plugin-app-engine:deploy",
          "options": {
            "project": "[gcp-project-name]"
          },
          "configurations": {
            "production": {
              "promote": true
            },
            "issue": {
              "noPromote": true,
              "version": "issue"
            }
          }
        }
      }
    }
  }
}
```

###### `.gitlab-ci.yml`

```yaml
image: node:lts

before_script:
  - yarn

stages:
  - build
  - deploy

build:production:
  # builds the project [project-name] with the production configuration
  script: yarn nx [project-name]:build:production
  # expose the build artifacts
  artifacts:
    paths:
      - dist
  # job runs only on the production branch
  only:
    - production

deploy:production:
  # the app will be deployed in the gcp project [gcp-project-name]
  # and all traffic will be redirected to the new version
  script: yarn nx [project-name]:app-engine-deploy:production --skip-build
  dependencies:
    - build:production
  only:
    - production

deploy:issue:
  script: yarn nx [project-name]:app-engine-deploy:issue
  only:
    - /^[0-9]+-.*$/

```
