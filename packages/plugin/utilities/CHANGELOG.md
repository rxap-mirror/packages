# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [16.1.0-dev.19](https://gitlab.com/rxap/packages/compare/@rxap/plugin-utilities@1.1.0-dev.0...@rxap/plugin-utilities@16.1.0-dev.19) (2023-10-11)

### Bug Fixes

- add licence file to publishable packages ([d7de1cb](https://gitlab.com/rxap/packages/commit/d7de1cb9db1bd1628f37084e3b0ffd1755aa75f6))
- change from commonjs to es2022 ([cf675a7](https://gitlab.com/rxap/packages/commit/cf675a7254de9ce4b269264df59794dd42fcbd8b))
- ensure deterministic package json file ([ff6a814](https://gitlab.com/rxap/packages/commit/ff6a814637954ff34f8de1b81b07dd3bf382be83))
- ensure new line ([68718c6](https://gitlab.com/rxap/packages/commit/68718c6aeefe25313434cdd9f3decebcc0674e00))
- ensure the project name is not included in the project tag list ([46d4479](https://gitlab.com/rxap/packages/commit/46d44798258ea1b20df9d4408b9c0809f55027b2))
- expose generators as schematics ([8a58d07](https://gitlab.com/rxap/packages/commit/8a58d07c2f1dcfff75e724a418d7c3bddb2d0bbc))
- generate readme with peer dependencies to install ([27c2cd7](https://gitlab.com/rxap/packages/commit/27c2cd7d98f0c8a499b8c30719f49d69e4970ae9))
- if project source root is not defined use the project joined with src ([dd09c0e](https://gitlab.com/rxap/packages/commit/dd09c0ec6d0f5bd5b9fc030108cdaf990b6ab5f2))
- introduce Is\*Project functions ([3c9f251](https://gitlab.com/rxap/packages/commit/3c9f251f1d7be46ca366171e79e86ef2764fa3b0))
- only include project with package.json file ([8dcf3a2](https://gitlab.com/rxap/packages/commit/8dcf3a2a576c782d64552e7d692bca2330f90894))
- peer dependency issue ([ee95415](https://gitlab.com/rxap/packages/commit/ee95415370d9ef2396916d6c25061a0df791034a))
- remove nx dependency ([b2b98b0](https://gitlab.com/rxap/packages/commit/b2b98b01438e9439f9743fb27629c7e96072df45))
- split GuessOutputPath function ([470b93a](https://gitlab.com/rxap/packages/commit/470b93a97a44b11435ff045c79896d712c9721a9))
- support output path guess from project root ([77e184f](https://gitlab.com/rxap/packages/commit/77e184fe8779c6efbc3e06cb3e71a8cf7c4f3e5f))
- throw error if project does not exists in project graph ([c33145e](https://gitlab.com/rxap/packages/commit/c33145e114f6ac3c64da1dd7baa7e7c517437a9c))
- use absolute path to access files ([063676e](https://gitlab.com/rxap/packages/commit/063676e3a1f6061c9f3284f79e6ca8091242c0c7))

### Features

- add CleanupPackageJson function ([08ad46c](https://gitlab.com/rxap/packages/commit/08ad46c1fe249aa3ab2ad349e856a5331d5b5d3f))
- add GetAllPackageDependenciesForProject function ([4059619](https://gitlab.com/rxap/packages/commit/405961962d45c0643037524956134bf7abd6bda5))
- add project to package name mapping utilities ([09aa733](https://gitlab.com/rxap/packages/commit/09aa7335b0caf599b61a41cfa8cb899a41f3d34a))
- add ProjectSourceRoot files utility functions ([66b9649](https://gitlab.com/rxap/packages/commit/66b9649fdbd90dcc59a4f8bd206a54c810246290))

### Reverts

- change from commonjs to es2022 ([50eca61](https://gitlab.com/rxap/packages/commit/50eca61e9a89388d1cfeefb8b1029b302b6f307e))

# [16.1.0-dev.18](https://gitlab.com/rxap/packages/compare/@rxap/plugin-utilities@16.1.0-dev.17...@rxap/plugin-utilities@16.1.0-dev.18) (2023-10-02)

### Bug Fixes

- introduce Is\*Project functions ([0f4a53a](https://gitlab.com/rxap/packages/commit/0f4a53a2a68c7f854d819c005a30957d8b1cb3c6))

# [16.1.0-dev.17](https://gitlab.com/rxap/packages/compare/@rxap/plugin-utilities@16.1.0-dev.16...@rxap/plugin-utilities@16.1.0-dev.17) (2023-10-02)

### Bug Fixes

- if project source root is not defined use the project joined with src ([198eef9](https://gitlab.com/rxap/packages/commit/198eef996f2c5c640da453417dadea338a13198b))

### Features

- add ProjectSourceRoot files utility functions ([49213ae](https://gitlab.com/rxap/packages/commit/49213aea481555b77536fe598987fb92a8754d76))

# [16.1.0-dev.16](https://gitlab.com/rxap/packages/compare/@rxap/plugin-utilities@16.1.0-dev.15...@rxap/plugin-utilities@16.1.0-dev.16) (2023-09-27)

**Note:** Version bump only for package @rxap/plugin-utilities

# [16.1.0-dev.15](https://gitlab.com/rxap/packages/compare/@rxap/plugin-utilities@16.1.0-dev.14...@rxap/plugin-utilities@16.1.0-dev.15) (2023-09-17)

### Bug Fixes

- split GuessOutputPath function ([5fc44e1](https://gitlab.com/rxap/packages/commit/5fc44e1470ca16b542e0b45049bfd9a83b8baab8))

# [16.1.0-dev.14](https://gitlab.com/rxap/packages/compare/@rxap/plugin-utilities@16.1.0-dev.13...@rxap/plugin-utilities@16.1.0-dev.14) (2023-09-12)

### Bug Fixes

- peer dependency issue ([e67e2b8](https://gitlab.com/rxap/packages/commit/e67e2b8eb884b598536d16c2c544a9ad9be5b53e))

# [16.1.0-dev.13](https://gitlab.com/rxap/packages/compare/@rxap/plugin-utilities@16.1.0-dev.12...@rxap/plugin-utilities@16.1.0-dev.13) (2023-09-12)

### Bug Fixes

- ensure deterministic package json file ([c1a9971](https://gitlab.com/rxap/packages/commit/c1a9971349bf01630b709bb8c46bd0397088f871))
- support output path guess from project root ([1757fdf](https://gitlab.com/rxap/packages/commit/1757fdf6e3f00fafa90d17e3ca24bf3cc711b33e))

### Features

- add CleanupPackageJson function ([0b5c0ce](https://gitlab.com/rxap/packages/commit/0b5c0cee7d080b9948953dc856af20e2516cf024))

# [16.1.0-dev.12](https://gitlab.com/rxap/packages/compare/@rxap/plugin-utilities@16.1.0-dev.11...@rxap/plugin-utilities@16.1.0-dev.12) (2023-09-07)

**Note:** Version bump only for package @rxap/plugin-utilities

# [16.1.0-dev.11](https://gitlab.com/rxap/packages/compare/@rxap/plugin-utilities@16.1.0-dev.10...@rxap/plugin-utilities@16.1.0-dev.11) (2023-09-03)

**Note:** Version bump only for package @rxap/plugin-utilities

# [16.1.0-dev.10](https://gitlab.com/rxap/packages/compare/@rxap/plugin-utilities@16.1.0-dev.9...@rxap/plugin-utilities@16.1.0-dev.10) (2023-09-03)

**Note:** Version bump only for package @rxap/plugin-utilities

# [16.1.0-dev.9](https://gitlab.com/rxap/packages/compare/@rxap/plugin-utilities@16.1.0-dev.8...@rxap/plugin-utilities@16.1.0-dev.9) (2023-08-31)

### Bug Fixes

- ensure the project name is not included in the project tag list ([b131ac3](https://gitlab.com/rxap/packages/commit/b131ac3bd92b3b8799d62f15bbd30a1997d7c753))

# [16.1.0-dev.8](https://gitlab.com/rxap/packages/compare/@rxap/plugin-utilities@16.1.0-dev.7...@rxap/plugin-utilities@16.1.0-dev.8) (2023-08-17)

### Reverts

- change from commonjs to es2022 ([747a381](https://gitlab.com/rxap/packages/commit/747a381a090f0a276cf363da61bb19ed0c9cb5b7))

# [16.1.0-dev.7](https://gitlab.com/rxap/packages/compare/@rxap/plugin-utilities@16.1.0-dev.6...@rxap/plugin-utilities@16.1.0-dev.7) (2023-08-16)

### Bug Fixes

- change from commonjs to es2022 ([fd0f2ba](https://gitlab.com/rxap/packages/commit/fd0f2bae24eae7c854e96f630076cd5598c30be6))

# [16.1.0-dev.6](https://gitlab.com/rxap/packages/compare/@rxap/plugin-utilities@16.1.0-dev.5...@rxap/plugin-utilities@16.1.0-dev.6) (2023-08-06)

### Bug Fixes

- ensure new line ([5562c46](https://gitlab.com/rxap/packages/commit/5562c46fbbb5705a4b383a9ea4ceb3945071b659))
- expose generators as schematics ([679ca36](https://gitlab.com/rxap/packages/commit/679ca36d3712a11e4dc838762bca2f7c471e1e04))

# [16.1.0-dev.5](https://gitlab.com/rxap/packages/compare/@rxap/plugin-utilities@16.1.0-dev.4...@rxap/plugin-utilities@16.1.0-dev.5) (2023-08-05)

### Bug Fixes

- only include project with package.json file ([e9e330f](https://gitlab.com/rxap/packages/commit/e9e330f432581beb996fd8aadadad89fd087f18a))

# [16.1.0-dev.4](https://gitlab.com/rxap/packages/compare/@rxap/plugin-utilities@16.1.0-dev.3...@rxap/plugin-utilities@16.1.0-dev.4) (2023-08-04)

### Bug Fixes

- add licence file to publishable packages ([ca6d4d5](https://gitlab.com/rxap/packages/commit/ca6d4d509a743b89bad5ed7ae935d3007231705a))

# [16.1.0-dev.3](https://gitlab.com/rxap/packages/compare/@rxap/plugin-utilities@16.1.0-dev.2...@rxap/plugin-utilities@16.1.0-dev.3) (2023-08-04)

### Bug Fixes

- remove nx dependency ([5cc2200](https://gitlab.com/rxap/packages/commit/5cc2200ca3f12ef39bb959f98730975978b5194e))

# [16.1.0-dev.2](https://gitlab.com/rxap/packages/compare/@rxap/plugin-utilities@16.1.0-dev.1...@rxap/plugin-utilities@16.1.0-dev.2) (2023-08-03)

### Bug Fixes

- use absolute path to access files ([32323ab](https://gitlab.com/rxap/packages/commit/32323ab900da408dcd6ae05dc12e562feff798f9))

# [16.1.0-dev.1](https://gitlab.com/rxap/packages/compare/@rxap/plugin-utilities@16.1.0-dev.0...@rxap/plugin-utilities@16.1.0-dev.1) (2023-08-03)

### Bug Fixes

- generate readme with peer dependencies to install ([e7039bb](https://gitlab.com/rxap/packages/commit/e7039bb5e86ffeadfe7cc92d5fc71d32f8efb4fb))
- throw error if project does not exists in project graph ([f65d512](https://gitlab.com/rxap/packages/commit/f65d512be43869e6f09515d9a6ec7c339da0c824))

### Features

- add GetAllPackageDependenciesForProject function ([12e742b](https://gitlab.com/rxap/packages/commit/12e742bb2eb5f0211b20f8ccf23db22fe37ec86d))
- add project to package name mapping utilities ([424cb4a](https://gitlab.com/rxap/packages/commit/424cb4ac676b46a277fdb051cb11038199c6ecee))

# 16.1.0-dev.0 (2023-08-01)

### Bug Fixes

- restructure and merge mono repos packages, schematics, plugins and nest ([a057d77](https://gitlab.com/rxap/packages/commit/a057d77ca2acf9426a03a497da8532f8a2fe2c86))
- update package dependency versions ([45bd022](https://gitlab.com/rxap/packages/commit/45bd022d755c0c11f7d0bcc76d26b39928007941))

### Features

- add project target utility functions ([cc79637](https://gitlab.com/rxap/packages/commit/cc796375dac06cac6b8df13fb584ae7b17ed8c11))

# [1.1.0-dev.0](https://gitlab.com/rxap/packages/compare/@rxap/plugin-utilities@1.0.1-dev.1...@rxap/plugin-utilities@1.1.0-dev.0) (2023-07-20)

### Features

- add project target utility functions ([d0e1577](https://gitlab.com/rxap/packages/commit/d0e1577e962b3836c16ecae521d7aef0d01b62bc))

## [1.0.1-dev.1](https://gitlab.com/rxap/packages/compare/@rxap/plugin-utilities@1.0.1-dev.0...@rxap/plugin-utilities@1.0.1-dev.1) (2023-07-10)

### Bug Fixes

- update package dependency versions ([8479f5c](https://gitlab.com/rxap/packages/commit/8479f5c405a885cc0f300cec6156584e4c65d59c))

## 1.0.1-dev.0 (2023-07-10)

### Bug Fixes

- restructure and merge mono repos packages, schematics, plugins and nest ([653b4cd](https://gitlab.com/rxap/packages/commit/653b4cd39fc92d322df9b3959651fea0aa6079da))
