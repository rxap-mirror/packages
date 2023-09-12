# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [16.1.0-dev.19](https://gitlab.com/rxap/packages/compare/@rxap/plugin-nestjs@16.1.0-dev.18...@rxap/plugin-nestjs@16.1.0-dev.19) (2023-09-12)

### Bug Fixes

- add development configuration to build target ([393a03a](https://gitlab.com/rxap/packages/commit/393a03aa54366fd1a037aac9ef42a57a23258f1f))
- use local status server if possible ([d9b48fa](https://gitlab.com/rxap/packages/commit/d9b48fa8f862d769e7c2675226a900eca3b8fde5))
- use ready hook for RegisterToStatusService ([b0b1cd5](https://gitlab.com/rxap/packages/commit/b0b1cd5273343ae09ab1b3c3dd2d0fae951d7cbd))

# [16.1.0-dev.18](https://gitlab.com/rxap/packages/compare/@rxap/plugin-nestjs@16.1.0-dev.17...@rxap/plugin-nestjs@16.1.0-dev.18) (2023-09-12)

### Bug Fixes

- improve nest application init generator execution ([30adde1](https://gitlab.com/rxap/packages/commit/30adde1b164884137890e4c604ed86a7a75261d9))
- use unified Dockerfile ([913898d](https://gitlab.com/rxap/packages/commit/913898d976a56873caabd2140cf2e6e0fef15214))

### Reverts

- "build: use nx run commands to build openapi.json" ([b294956](https://gitlab.com/rxap/packages/commit/b294956b25d42350a1e0907635c88776a39b7708))

# [16.1.0-dev.17](https://gitlab.com/rxap/packages/compare/@rxap/plugin-nestjs@16.1.0-dev.16...@rxap/plugin-nestjs@16.1.0-dev.17) (2023-09-09)

### Features

- add openapi utility operation generation ([9e67895](https://gitlab.com/rxap/packages/commit/9e678950b7f47bb39768f2d41c3a64b3af7a3c10))

# [16.1.0-dev.16](https://gitlab.com/rxap/packages/compare/@rxap/plugin-nestjs@16.1.0-dev.15...@rxap/plugin-nestjs@16.1.0-dev.16) (2023-09-07)

**Note:** Version bump only for package @rxap/plugin-nestjs

# [16.1.0-dev.15](https://gitlab.com/rxap/packages/compare/@rxap/plugin-nestjs@16.1.0-dev.14...@rxap/plugin-nestjs@16.1.0-dev.15) (2023-09-03)

**Note:** Version bump only for package @rxap/plugin-nestjs

# [16.1.0-dev.14](https://gitlab.com/rxap/packages/compare/@rxap/plugin-nestjs@16.1.0-dev.13...@rxap/plugin-nestjs@16.1.0-dev.14) (2023-09-03)

**Note:** Version bump only for package @rxap/plugin-nestjs

# [16.1.0-dev.13](https://gitlab.com/rxap/packages/compare/@rxap/plugin-nestjs@16.1.0-dev.12...@rxap/plugin-nestjs@16.1.0-dev.13) (2023-09-03)

### Bug Fixes

- create health files if not exist ([ea81a96](https://gitlab.com/rxap/packages/commit/ea81a964686256ea0c7d1a52cb09d6481a47cc98))
- remove support for open-api client sdk packages ([ace153f](https://gitlab.com/rxap/packages/commit/ace153f977690e7714c3c4110600e2a8916a0d52))
- respect the overwrite flag ([3234759](https://gitlab.com/rxap/packages/commit/32347594f4e3f27eb639647d6db0ec61a8537d04))
- use es module import style ([f844c22](https://gitlab.com/rxap/packages/commit/f844c22eac4a4e5ef288eb1039879faa207c9889))

# [16.1.0-dev.12](https://gitlab.com/rxap/packages/compare/@rxap/plugin-nestjs@16.1.0-dev.11...@rxap/plugin-nestjs@16.1.0-dev.12) (2023-09-02)

### Bug Fixes

- use the plugin-open-api project for client sdk generation ([5097269](https://gitlab.com/rxap/packages/commit/509726988a0bcb10a39dedff3bde9bbc36cf1331))

### Features

- support open-api package project generation ([d1f2d03](https://gitlab.com/rxap/packages/commit/d1f2d03a1b6bca7171fc04dc161bb62325017fc6))

# [16.1.0-dev.11](https://gitlab.com/rxap/packages/compare/@rxap/plugin-nestjs@16.1.0-dev.10...@rxap/plugin-nestjs@16.1.0-dev.11) (2023-09-01)

### Bug Fixes

- default status service base url var generation ([9509086](https://gitlab.com/rxap/packages/commit/95090864e8eda444fa2a849dbf2fb4b608afcc7c))
- ensure the env replacement for nest application is defined ([692dda5](https://gitlab.com/rxap/packages/commit/692dda5e52a20ac3158cf2d07e96e44de4f1fe77))
- set default throttler ttl to 1 ([dcd9f60](https://gitlab.com/rxap/packages/commit/dcd9f609bd75245f0cf7e889f4eab2cc66cf995d))
- support config validation overwrite ([bd01600](https://gitlab.com/rxap/packages/commit/bd01600ba9e0159b4e338a902314436d45c7d782))
- use the new status service hostname ([c2655b6](https://gitlab.com/rxap/packages/commit/c2655b6c8f499755cc788da991ac9cebca05a49c))

# [16.1.0-dev.10](https://gitlab.com/rxap/packages/compare/@rxap/plugin-nestjs@16.1.0-dev.9...@rxap/plugin-nestjs@16.1.0-dev.10) (2023-08-31)

### Bug Fixes

- add missing template property ([11daed1](https://gitlab.com/rxap/packages/commit/11daed1cb52709ee436014f571642644dbb77fe9))
- add project ts-morph ([f17725d](https://gitlab.com/rxap/packages/commit/f17725dccf31d3f5fab9087e103e19ad5df43246))
- create an info path for the default app controller ([8d3ab19](https://gitlab.com/rxap/packages/commit/8d3ab197ba35ece19345e3eea78e938a512586e5))
- ensure overwrite option is passed to sub schematics ([8472aab](https://gitlab.com/rxap/packages/commit/8472aab8814227c851fab9ae4c1b9ec3019d6f4e))
- ensure the project name is not included in the project tag list ([b131ac3](https://gitlab.com/rxap/packages/commit/b131ac3bd92b3b8799d62f15bbd30a1997d7c753))
- pass overwrite option to utility function ([7bf4f62](https://gitlab.com/rxap/packages/commit/7bf4f62249879ec13cb476844cac143033d4a8b4))
- resolve issues ([07edb75](https://gitlab.com/rxap/packages/commit/07edb75b3ed6bedc2b831145d6ac5b57e342c6fd))
- streamline the nestjs application initialization ([4fcdde5](https://gitlab.com/rxap/packages/commit/4fcdde539d462efaaf6fe24000187c87bbad8c19))

### Features

- add the health indicator generator ([3153e97](https://gitlab.com/rxap/packages/commit/3153e97c034d3f8856a68cf507ac88b5fb8c53bc))
- add the jwt generator ([b9d22b1](https://gitlab.com/rxap/packages/commit/b9d22b1fc6c7b7bfa960012f92a1a9f74fd20a32))
- add the mandatory app property to the environment object ([2655e0d](https://gitlab.com/rxap/packages/commit/2655e0d5449949a67b38044d34e6180f22ffc9c1))
- add the open-api generator ([6ecf74d](https://gitlab.com/rxap/packages/commit/6ecf74d83dfb7092523fdeb6dc7e925f8aece46e))
- add the sentry generator ([567eb83](https://gitlab.com/rxap/packages/commit/567eb83f2932643f359eb844db9b104e0b6c223d))
- add the validator generator ([810ff12](https://gitlab.com/rxap/packages/commit/810ff12308a98446c37f03ae2523b1d7d7a8b7d5))
- exclude health path from global api prefix ([15a5dbe](https://gitlab.com/rxap/packages/commit/15a5dbe4581e943bd7d0775fd87f8c2b0322cc02))
- generate status registry feature ([aff8ff8](https://gitlab.com/rxap/packages/commit/aff8ff8f0e67e6181383beb93ee1f7c898c9a2ea))

# [16.1.0-dev.9](https://gitlab.com/rxap/packages/compare/@rxap/plugin-nestjs@16.1.0-dev.8...@rxap/plugin-nestjs@16.1.0-dev.9) (2023-08-17)

### Reverts

- change from commonjs to es2022 ([747a381](https://gitlab.com/rxap/packages/commit/747a381a090f0a276cf363da61bb19ed0c9cb5b7))

# [16.1.0-dev.8](https://gitlab.com/rxap/packages/compare/@rxap/plugin-nestjs@16.1.0-dev.7...@rxap/plugin-nestjs@16.1.0-dev.8) (2023-08-16)

### Bug Fixes

- change from commonjs to es2022 ([fd0f2ba](https://gitlab.com/rxap/packages/commit/fd0f2bae24eae7c854e96f630076cd5598c30be6))

# [16.1.0-dev.7](https://gitlab.com/rxap/packages/compare/@rxap/plugin-nestjs@16.1.0-dev.6...@rxap/plugin-nestjs@16.1.0-dev.7) (2023-08-14)

### Bug Fixes

- soft fail for library generation ([109f456](https://gitlab.com/rxap/packages/commit/109f456e74f048942a09d2c579539b80ea620134))

# [16.1.0-dev.6](https://gitlab.com/rxap/packages/compare/@rxap/plugin-nestjs@16.1.0-dev.5...@rxap/plugin-nestjs@16.1.0-dev.6) (2023-08-06)

### Bug Fixes

- expose generators as schematics ([679ca36](https://gitlab.com/rxap/packages/commit/679ca36d3712a11e4dc838762bca2f7c471e1e04))

# [16.1.0-dev.5](https://gitlab.com/rxap/packages/compare/@rxap/plugin-nestjs@16.1.0-dev.4...@rxap/plugin-nestjs@16.1.0-dev.5) (2023-08-05)

### Bug Fixes

- only skip swagger configuration if explicit disabled ([97435db](https://gitlab.com/rxap/packages/commit/97435db71cba7c38f9821335d33e93689105b836))

# [16.1.0-dev.4](https://gitlab.com/rxap/packages/compare/@rxap/plugin-nestjs@16.1.0-dev.3...@rxap/plugin-nestjs@16.1.0-dev.4) (2023-08-04)

### Bug Fixes

- add licence file to publishable packages ([ca6d4d5](https://gitlab.com/rxap/packages/commit/ca6d4d509a743b89bad5ed7ae935d3007231705a))

### Features

- add generate-open-api target to nestjs application projects ([bcb4e9e](https://gitlab.com/rxap/packages/commit/bcb4e9e6104e1fba63a1026da8e50dda6ff172b1))
- mv swagger generator to plugin-nestjs ([cf2ecbb](https://gitlab.com/rxap/packages/commit/cf2ecbb16b681cb04d392d17bb987b24e8c9224b))

# [16.1.0-dev.3](https://gitlab.com/rxap/packages/compare/@rxap/plugin-nestjs@16.1.0-dev.2...@rxap/plugin-nestjs@16.1.0-dev.3) (2023-08-04)

### Bug Fixes

- ensure projects are buildable or publishable ([781a8b7](https://gitlab.com/rxap/packages/commit/781a8b77d9e7f74493347516b5e678a42e1e32df))

# [16.1.0-dev.2](https://gitlab.com/rxap/packages/compare/@rxap/plugin-nestjs@16.1.0-dev.1...@rxap/plugin-nestjs@16.1.0-dev.2) (2023-08-03)

### Features

- add project json generator executor ([c92ea78](https://gitlab.com/rxap/packages/commit/c92ea7800271b611894c33d243e7de0dc9031f32))

# [16.1.0-dev.1](https://gitlab.com/rxap/packages/compare/@rxap/plugin-nestjs@16.1.0-dev.0...@rxap/plugin-nestjs@16.1.0-dev.1) (2023-08-01)

### Bug Fixes

- generate readme with peer dependencies to install ([e7039bb](https://gitlab.com/rxap/packages/commit/e7039bb5e86ffeadfe7cc92d5fc71d32f8efb4fb))
- skip plugin or schematic projects ([c87532b](https://gitlab.com/rxap/packages/commit/c87532b33e3e88515e4c1735901711c4fe04ce3c))

# 16.1.0-dev.0 (2023-08-01)

### Bug Fixes

- set correct schema types ([86beb9b](https://gitlab.com/rxap/packages/commit/86beb9b1a9fb17a8aadc55fb4406f81dddc52cf1))

### Features

- **init-application:** add nest init application generator ([6667353](https://gitlab.com/rxap/packages/commit/666735357d838b2dc96fee3d807b4e27a209f3cf))
- **init-library:** add nest init library generator ([cf99d36](https://gitlab.com/rxap/packages/commit/cf99d36ce45a0ebfd62b08da92f83b868e204527))
- **init:** add nest init generator ([c59cc52](https://gitlab.com/rxap/packages/commit/c59cc52a50fc3d0a8ae11512bbe20f88c6455d85))
