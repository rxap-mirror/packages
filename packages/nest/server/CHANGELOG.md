# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [10.1.0-dev.12](https://gitlab.com/rxap/packages/compare/@rxap/nest-server@10.1.0-dev.11...@rxap/nest-server@10.1.0-dev.12) (2023-09-18)

### Bug Fixes

- use the local ip address ([cf656ed](https://gitlab.com/rxap/packages/commit/cf656ed0d7d52c2047de609e1731438302777f98))

# [10.1.0-dev.11](https://gitlab.com/rxap/packages/compare/@rxap/nest-server@10.1.0-dev.10...@rxap/nest-server@10.1.0-dev.11) (2023-09-18)

### Bug Fixes

- parse public port ([0e8d348](https://gitlab.com/rxap/packages/commit/0e8d348cfdcd6e9d9ec3e62aedefcb348323991f))

# [10.1.0-dev.10](https://gitlab.com/rxap/packages/compare/@rxap/nest-server@10.1.0-dev.9...@rxap/nest-server@10.1.0-dev.10) (2023-09-15)

### Bug Fixes

- support ROOT_DOMAIN_PORT env ([90efcd7](https://gitlab.com/rxap/packages/commit/90efcd7def13eb914b938375ec40db6a62d2faac))

# [10.1.0-dev.9](https://gitlab.com/rxap/packages/compare/@rxap/nest-server@10.1.0-dev.8...@rxap/nest-server@10.1.0-dev.9) (2023-09-15)

### Features

- extend public url parsing ([63e29f2](https://gitlab.com/rxap/packages/commit/63e29f2675ab78ad30292182f278f3c0f08526fd))

# [10.1.0-dev.8](https://gitlab.com/rxap/packages/compare/@rxap/nest-server@10.1.0-dev.7...@rxap/nest-server@10.1.0-dev.8) (2023-09-12)

### Bug Fixes

- peer dependency issue ([e67e2b8](https://gitlab.com/rxap/packages/commit/e67e2b8eb884b598536d16c2c544a9ad9be5b53e))

# [10.1.0-dev.7](https://gitlab.com/rxap/packages/compare/@rxap/nest-server@10.1.0-dev.6...@rxap/nest-server@10.1.0-dev.7) (2023-09-12)

### Bug Fixes

- improve startup logging ([875e80f](https://gitlab.com/rxap/packages/commit/875e80fff7ec7e2413417b3cfef68054ffd55a4c))

# [10.1.0-dev.6](https://gitlab.com/rxap/packages/compare/@rxap/nest-server@10.1.0-dev.5...@rxap/nest-server@10.1.0-dev.6) (2023-09-12)

### Bug Fixes

- add application options ([31f490d](https://gitlab.com/rxap/packages/commit/31f490de262555b69367e72872620c9d1594e329))
- provide environment ([62683ec](https://gitlab.com/rxap/packages/commit/62683eca0824fc42a6545b05a2d56bd5b1922faf))
- use factory function ([657a9f9](https://gitlab.com/rxap/packages/commit/657a9f91150883aac098320aa421a8eb1f73f784))

### Features

- add SetupCookieParser function ([7d0d577](https://gitlab.com/rxap/packages/commit/7d0d577c926cda3ac586571ab2c659de1d6652bb))
- add SetupCors function ([693b53a](https://gitlab.com/rxap/packages/commit/693b53aef3bf402b2d8e11ff688ef154a4c7f93d))
- add SetupHelmet function ([71e22cf](https://gitlab.com/rxap/packages/commit/71e22cf52c2d4a68b75f40e9008d93b8246fedfe))
- add SetupSwagger function ([3a73d63](https://gitlab.com/rxap/packages/commit/3a73d63b8f53b5c20ad1735a9db83ba0a2d84d90))
- add ValidationPipeSetup function ([ec7dabd](https://gitlab.com/rxap/packages/commit/ec7dabd901a1ea208e2f8d3dff189ce6ee726398))

# [10.1.0-dev.5](https://gitlab.com/rxap/packages/compare/@rxap/nest-server@10.1.0-dev.4...@rxap/nest-server@10.1.0-dev.5) (2023-09-09)

### Bug Fixes

- add /openapi path global prefix exclude pattern ([eb58912](https://gitlab.com/rxap/packages/commit/eb5891270943b29273142ae5dde51ebe03e61f38))

# [10.1.0-dev.4](https://gitlab.com/rxap/packages/compare/@rxap/nest-server@10.1.0-dev.3...@rxap/nest-server@10.1.0-dev.4) (2023-09-09)

### Bug Fixes

- retry service register if failed ([136c760](https://gitlab.com/rxap/packages/commit/136c7600886717ab1c4bab99de55314ca695f4f0))

# [10.1.0-dev.3](https://gitlab.com/rxap/packages/compare/@rxap/nest-server@10.1.0-dev.2...@rxap/nest-server@10.1.0-dev.3) (2023-09-07)

**Note:** Version bump only for package @rxap/nest-server

# [10.1.0-dev.2](https://gitlab.com/rxap/packages/compare/@rxap/nest-server@10.1.0-dev.1...@rxap/nest-server@10.1.0-dev.2) (2023-09-03)

**Note:** Version bump only for package @rxap/nest-server

# [10.1.0-dev.1](https://gitlab.com/rxap/packages/compare/@rxap/nest-server@10.1.0-dev.0...@rxap/nest-server@10.1.0-dev.1) (2023-09-03)

**Note:** Version bump only for package @rxap/nest-server

# [10.1.0-dev.0](https://gitlab.com/rxap/packages/compare/@rxap/nest-server@10.0.1-dev.3...@rxap/nest-server@10.1.0-dev.0) (2023-08-31)

### Bug Fixes

- ensure the project name is not included in the project tag list ([b131ac3](https://gitlab.com/rxap/packages/commit/b131ac3bd92b3b8799d62f15bbd30a1997d7c753))
- include the /info path to default global api prefix ignore rules ([0043782](https://gitlab.com/rxap/packages/commit/0043782c27d6aa158314ef7cacd57bf110b07922))

### Features

- add RegisterToStatusService utility function ([53fd276](https://gitlab.com/rxap/packages/commit/53fd276c237dffd48a0793d99858456a9d8c5f05))
- add support for hybrid server bootstrap ([02ff956](https://gitlab.com/rxap/packages/commit/02ff956b10a508b5d0af3903d5f81cdd858c5da1))
- add support for on ready hooks ([50bf887](https://gitlab.com/rxap/packages/commit/50bf887c444951f4daf3871a3a30115e66aee0df))
- exclude health path from global api prefix ([15a5dbe](https://gitlab.com/rxap/packages/commit/15a5dbe4581e943bd7d0775fd87f8c2b0322cc02))

## [10.0.1-dev.3](https://gitlab.com/rxap/packages/compare/@rxap/nest-server@10.0.1-dev.2...@rxap/nest-server@10.0.1-dev.3) (2023-08-17)

### Reverts

- change from commonjs to es2022 ([747a381](https://gitlab.com/rxap/packages/commit/747a381a090f0a276cf363da61bb19ed0c9cb5b7))

## [10.0.1-dev.2](https://gitlab.com/rxap/packages/compare/@rxap/nest-server@10.0.1-dev.1...@rxap/nest-server@10.0.1-dev.2) (2023-08-16)

### Bug Fixes

- change from commonjs to es2022 ([fd0f2ba](https://gitlab.com/rxap/packages/commit/fd0f2bae24eae7c854e96f630076cd5598c30be6))

## [10.0.1-dev.1](https://gitlab.com/rxap/packages/compare/@rxap/nest-server@10.0.1-dev.0...@rxap/nest-server@10.0.1-dev.1) (2023-08-04)

### Bug Fixes

- add licence file to publishable packages ([ca6d4d5](https://gitlab.com/rxap/packages/commit/ca6d4d509a743b89bad5ed7ae935d3007231705a))
- generate readme with peer dependencies to install ([e7039bb](https://gitlab.com/rxap/packages/commit/e7039bb5e86ffeadfe7cc92d5fc71d32f8efb4fb))

## 10.0.1-dev.0 (2023-08-01)

### Bug Fixes

- restructure and merge mono repos packages, schematics, plugins and nest ([a057d77](https://gitlab.com/rxap/packages/commit/a057d77ca2acf9426a03a497da8532f8a2fe2c86))
- update package dependency versions ([45bd022](https://gitlab.com/rxap/packages/commit/45bd022d755c0c11f7d0bcc76d26b39928007941))
- update to nx 16.5.0 ([1304640](https://gitlab.com/rxap/packages/commit/1304640641e351aef07bc4a2eaff339fcce6ec99))

## [1.0.1-dev.1](https://gitlab.com/rxap/packages/compare/@rxap/nest-server@1.0.1-dev.0...@rxap/nest-server@1.0.1-dev.1) (2023-07-10)

### Bug Fixes

- update package dependency versions ([8479f5c](https://gitlab.com/rxap/packages/commit/8479f5c405a885cc0f300cec6156584e4c65d59c))
- update to nx 16.5.0 ([73f7575](https://gitlab.com/rxap/packages/commit/73f7575ba378b8b03d2a2646f1761c01b16a6e09))

## 1.0.1-dev.0 (2023-07-10)

### Bug Fixes

- restructure and merge mono repos packages, schematics, plugins and nest ([653b4cd](https://gitlab.com/rxap/packages/commit/653b4cd39fc92d322df9b3959651fea0aa6079da))
