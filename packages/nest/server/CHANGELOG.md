# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [10.1.0](https://gitlab.com/rxap/packages/compare/@rxap/nest-server@10.1.0-dev.17...@rxap/nest-server@10.1.0) (2024-02-07)

**Note:** Version bump only for package @rxap/nest-server

# [10.1.0-dev.17](https://gitlab.com/rxap/packages/compare/@rxap/nest-server@1.0.1-dev.1...@rxap/nest-server@10.1.0-dev.17) (2023-10-11)

### Bug Fixes

- add /openapi path global prefix exclude pattern ([278e40e](https://gitlab.com/rxap/packages/commit/278e40e4a5b0399fd661e92123b0463abfc89ef1))
- add application options ([e3680f7](https://gitlab.com/rxap/packages/commit/e3680f737eddae6ef8e5e3cc34997d50d317c489))
- add licence file to publishable packages ([d7de1cb](https://gitlab.com/rxap/packages/commit/d7de1cb9db1bd1628f37084e3b0ffd1755aa75f6))
- change from commonjs to es2022 ([cf675a7](https://gitlab.com/rxap/packages/commit/cf675a7254de9ce4b269264df59794dd42fcbd8b))
- ensure the project name is not included in the project tag list ([46d4479](https://gitlab.com/rxap/packages/commit/46d44798258ea1b20df9d4408b9c0809f55027b2))
- generate readme with peer dependencies to install ([27c2cd7](https://gitlab.com/rxap/packages/commit/27c2cd7d98f0c8a499b8c30719f49d69e4970ae9))
- improve startup logging ([4193ded](https://gitlab.com/rxap/packages/commit/4193dedc16d819b9930d253be2e139df2623dc0d))
- include the /info path to default global api prefix ignore rules ([1ed9ab0](https://gitlab.com/rxap/packages/commit/1ed9ab0b0233fe959c9ebc09cd3fea02165a2f74))
- only check for ENVIRONMENT_NAME env inconsistency if the variable is set ([0f42b44](https://gitlab.com/rxap/packages/commit/0f42b44d903f4ceda13fa6254e536e49bfb5a361))
- parse public port ([b5f5477](https://gitlab.com/rxap/packages/commit/b5f5477a98ef43402e93518d01d57f71afb46e57))
- peer dependency issue ([ee95415](https://gitlab.com/rxap/packages/commit/ee95415370d9ef2396916d6c25061a0df791034a))
- provide environment ([293f435](https://gitlab.com/rxap/packages/commit/293f435307d751c9fee2929dabe39b1328a37cdf))
- retry service register if failed ([d61af7b](https://gitlab.com/rxap/packages/commit/d61af7b94e0bc045bc4d85574c6aeb5909c73fe3))
- set custom env name before application creation ([c710ebb](https://gitlab.com/rxap/packages/commit/c710ebbb7de12ca8053acb502807ae7012fe5980))
- support ROOT_DOMAIN_PORT env ([b91c5d1](https://gitlab.com/rxap/packages/commit/b91c5d1c84fb12502c4da90adf5bf6ad0a06c30d))
- use factory function ([1fdae7f](https://gitlab.com/rxap/packages/commit/1fdae7f3af3d5defc4b810fa2411ed7c5c7e5c97))
- use the hostname as ROOT_DOMAIN if not defined ([91d7641](https://gitlab.com/rxap/packages/commit/91d7641343b2221935b8e71bb6e3e4e013fecab8))
- use the local ip address ([4de467d](https://gitlab.com/rxap/packages/commit/4de467d74857c2f3df01d57c27d7b972f577d0ab))

### Features

- add RegisterToStatusService utility function ([4565731](https://gitlab.com/rxap/packages/commit/4565731b5dc9d9161815035fab66314d3f5f5413))
- add SetupCookieParser function ([6cf5a63](https://gitlab.com/rxap/packages/commit/6cf5a633661ba6fc0511e5966509636365879961))
- add SetupCors function ([d9c660b](https://gitlab.com/rxap/packages/commit/d9c660b5c8249f750c465d8f2cddf6f746789b04))
- add SetupHelmet function ([8bcd86d](https://gitlab.com/rxap/packages/commit/8bcd86d6617cff71eefb169ca54b61274ca797bc))
- add SetupSwagger function ([9bda155](https://gitlab.com/rxap/packages/commit/9bda155a21e632fce4933f5223f78668ca7cbbab))
- add support for hybrid server bootstrap ([c7ce6c5](https://gitlab.com/rxap/packages/commit/c7ce6c511a8a80d87a9e713959377e73212b2d59))
- add support for on ready hooks ([49e5dda](https://gitlab.com/rxap/packages/commit/49e5dda6a1698d7c727ce38a00d1a05e74d046be))
- add ValidationPipeSetup function ([8139f93](https://gitlab.com/rxap/packages/commit/8139f939e182dca2109f46e7bb018f362258bb8f))
- exclude health path from global api prefix ([023456b](https://gitlab.com/rxap/packages/commit/023456b9dae37372f2b1f0a8e6efadf285973010))
- extend public url parsing ([035bdae](https://gitlab.com/rxap/packages/commit/035bdaeae2749a1f107f3a46f483a4283633d838))
- support setting custom environment names ([d82f2a7](https://gitlab.com/rxap/packages/commit/d82f2a7f76fb5783c3b6878ddfd3d0a51c1c9e97))

### Reverts

- change from commonjs to es2022 ([50eca61](https://gitlab.com/rxap/packages/commit/50eca61e9a89388d1cfeefb8b1029b302b6f307e))

# [10.1.0-dev.16](https://gitlab.com/rxap/packages/compare/@rxap/nest-server@10.1.0-dev.15...@rxap/nest-server@10.1.0-dev.16) (2023-10-02)

### Bug Fixes

- only check for ENVIRONMENT_NAME env inconsistency if the variable is set ([8214c0d](https://gitlab.com/rxap/packages/commit/8214c0d55aeacdda5ceab337ea3a9d188027a4e6))

# [10.1.0-dev.15](https://gitlab.com/rxap/packages/compare/@rxap/nest-server@10.1.0-dev.14...@rxap/nest-server@10.1.0-dev.15) (2023-10-01)

### Bug Fixes

- set custom env name before application creation ([24b849b](https://gitlab.com/rxap/packages/commit/24b849bf3744742caaba2871a370f94f665c1057))

# [10.1.0-dev.14](https://gitlab.com/rxap/packages/compare/@rxap/nest-server@10.1.0-dev.13...@rxap/nest-server@10.1.0-dev.14) (2023-10-01)

### Bug Fixes

- use the hostname as ROOT_DOMAIN if not defined ([1fb09be](https://gitlab.com/rxap/packages/commit/1fb09be583e9b3c0632abeda74634807bc0e470d))

### Features

- support setting custom environment names ([5d74ee9](https://gitlab.com/rxap/packages/commit/5d74ee966b26cd0c73b6197911dfb36a9275f147))

# [10.1.0-dev.13](https://gitlab.com/rxap/packages/compare/@rxap/nest-server@10.1.0-dev.12...@rxap/nest-server@10.1.0-dev.13) (2023-09-27)

**Note:** Version bump only for package @rxap/nest-server

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
