# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [16.1.0-dev.34](https://gitlab.com/rxap/packages/compare/@rxap/plugin-application@16.1.0-dev.33...@rxap/plugin-application@16.1.0-dev.34) (2023-10-18)

### Features

- add cacheable operation deploy ([146d52b](https://gitlab.com/rxap/packages/commit/146d52b920829dbebb7c5437391e13461edba93c))
- extract default and available languages from target options ([5fe5617](https://gitlab.com/rxap/packages/commit/5fe5617b9a639f6e0cfdd8d619e3b043eafd8be7))

# [16.1.0-dev.33](https://gitlab.com/rxap/packages/compare/@rxap/plugin-application@16.1.0-dev.32...@rxap/plugin-application@16.1.0-dev.33) (2023-10-18)

### Bug Fixes

- update default ci configuration and scripts ([b80edb7](https://gitlab.com/rxap/packages/commit/b80edb79cc86506985c213f561a5d1509504ea09))

# [16.1.0-dev.32](https://gitlab.com/rxap/packages/compare/@rxap/plugin-application@16.1.0-dev.31...@rxap/plugin-application@16.1.0-dev.32) (2023-10-11)

**Note:** Version bump only for package @rxap/plugin-application

# [16.1.0-dev.31](https://gitlab.com/rxap/packages/compare/@rxap/plugin-application@16.1.0-dev.30...@rxap/plugin-application@16.1.0-dev.31) (2023-10-11)

**Note:** Version bump only for package @rxap/plugin-application

# [16.1.0-dev.30](https://gitlab.com/rxap/packages/compare/@rxap/plugin-application@16.0.1-dev.0...@rxap/plugin-application@16.1.0-dev.30) (2023-10-11)

### Bug Fixes

- add licence file to publishable packages ([d7de1cb](https://gitlab.com/rxap/packages/commit/d7de1cb9db1bd1628f37084e3b0ffd1755aa75f6))
- add skip-projects flag ([e1f31ed](https://gitlab.com/rxap/packages/commit/e1f31ed837646f605ced82a52749e62af07ba939))
- call the nest init generator for nest projects ([97c5238](https://gitlab.com/rxap/packages/commit/97c52386c7ea7d233f2cb74f9d113187f9baac18))
- change from commonjs to es2022 ([cf675a7](https://gitlab.com/rxap/packages/commit/cf675a7254de9ce4b269264df59794dd42fcbd8b))
- cleanup code generation ([35866de](https://gitlab.com/rxap/packages/commit/35866deda8c2d03ba84f3a3a82bd96dc0b1d3318))
- enforce that the production configuration is the default configuration ([00ac30e](https://gitlab.com/rxap/packages/commit/00ac30e65dbe1008bff6d4f149631405fc81c200))
- ensure all required cacheable operations are defined ([d9ded9c](https://gitlab.com/rxap/packages/commit/d9ded9c5e150d9781ce490ad7ac292194d09bf2a))
- ensure overwrite option is passed to sub schematics ([0c8a19b](https://gitlab.com/rxap/packages/commit/0c8a19b5166f804aa335f739a00a5415bd97f61a))
- ensure the build target is set correctly ([3ab4e53](https://gitlab.com/rxap/packages/commit/3ab4e5386c2f711828950b2e00b7393c45b8ca6d))
- ensure the correct docker image tag is used ([0f66394](https://gitlab.com/rxap/packages/commit/0f66394b5ae83e454554f942693aac7eb6512966))
- ensure the project name is not included in the project tag list ([46d4479](https://gitlab.com/rxap/packages/commit/46d44798258ea1b20df9d4408b9c0809f55027b2))
- ensure yarn 3 is used for yarn install ([fba0ed7](https://gitlab.com/rxap/packages/commit/fba0ed77413985d5241e53e44d6d38d1dbd86c08))
- expose generators as schematics ([8a58d07](https://gitlab.com/rxap/packages/commit/8a58d07c2f1dcfff75e724a418d7c3bddb2d0bbc))
- generate readme with peer dependencies to install ([27c2cd7](https://gitlab.com/rxap/packages/commit/27c2cd7d98f0c8a499b8c30719f49d69e4970ae9))
- install required dependencies ([a416b24](https://gitlab.com/rxap/packages/commit/a416b24af4cedbb63218de1402e5cbb2ccaf68d9))
- introduce Is\*Project functions ([3c9f251](https://gitlab.com/rxap/packages/commit/3c9f251f1d7be46ca366171e79e86ef2764fa3b0))
- merge default configuration property with existing target ([7ff7b73](https://gitlab.com/rxap/packages/commit/7ff7b73067599b1fd6dfe7a382a1f8ed0b57d671))
- only add the image registry parameter if the $REGISTRY env is defined ([1d4e68e](https://gitlab.com/rxap/packages/commit/1d4e68eb170ce2d7d9a0e5ff22e2ff2be89513ed))
- peer dependency issue ([ee95415](https://gitlab.com/rxap/packages/commit/ee95415370d9ef2396916d6c25061a0df791034a))
- refactor the build.json concept ([3526821](https://gitlab.com/rxap/packages/commit/3526821aecd59e92ba9d5f2c6d9001dc936d007f))
- remove build info output formatting ([8bfba65](https://gitlab.com/rxap/packages/commit/8bfba6556261e7d9d6f72557a1b137725094e747))
- remove build info target ([bc11a45](https://gitlab.com/rxap/packages/commit/bc11a45229b0639478c0bcdbfae526aa540c4b84))
- remove git lfs for yarn cache files ([8895465](https://gitlab.com/rxap/packages/commit/889546500f7d8519a6d085e8c6bae7a9fe669a19))
- remove the replace strategy ([e9c2163](https://gitlab.com/rxap/packages/commit/e9c21633f11a88c84cb121584b2267498f89fc1a))
- run gitlab ci generators on application init ([84f804f](https://gitlab.com/rxap/packages/commit/84f804fb533ac84f80a708cff8c1b8c78f23707c))
- set default target options for docker and docker-save ([bbc024b](https://gitlab.com/rxap/packages/commit/bbc024bc0ea41b07bc6352da713430737b7a17d2))
- set environment name to development for development configurations ([4cbb6f8](https://gitlab.com/rxap/packages/commit/4cbb6f84d092c175f068681e653f402f81ecd7a9))
- split GuessOutputPath function ([470b93a](https://gitlab.com/rxap/packages/commit/470b93a97a44b11435ff045c79896d712c9721a9))
- update utility scripts ([e7de358](https://gitlab.com/rxap/packages/commit/e7de358bffdf241361a69ca3e4ff1122afc18131))
- use proper docker image names ([944a1bb](https://gitlab.com/rxap/packages/commit/944a1bb8b6dd7d894ec040968cb26b783453d428))
- use the dep glob explicitly ([ce86a5f](https://gitlab.com/rxap/packages/commit/ce86a5f56497845c4a1f041bf468c08adc978940))
- use utility function to coerce default target dependencies ([d8db29f](https://gitlab.com/rxap/packages/commit/d8db29f8bd66057455ee10e695df217f03dd6792))
- use utility images ([fd68896](https://gitlab.com/rxap/packages/commit/fd68896a9581be369d0db4dcc827a405e5eadf5e))

### Features

- add docker compose generator files ([cb16192](https://gitlab.com/rxap/packages/commit/cb161928f5e60d564814e67fb299b123a1e8339d))
- run build-info target before serve and ignore build.json files in source root folder ([9487edd](https://gitlab.com/rxap/packages/commit/9487eddc70b8a957b44908205eeb7bf867b51b7e))

### Reverts

- change from commonjs to es2022 ([50eca61](https://gitlab.com/rxap/packages/commit/50eca61e9a89388d1cfeefb8b1029b302b6f307e))

# [16.1.0-dev.29](https://gitlab.com/rxap/packages/compare/@rxap/plugin-application@16.1.0-dev.28...@rxap/plugin-application@16.1.0-dev.29) (2023-10-10)

**Note:** Version bump only for package @rxap/plugin-application

# [16.1.0-dev.28](https://gitlab.com/rxap/packages/compare/@rxap/plugin-application@16.1.0-dev.27...@rxap/plugin-application@16.1.0-dev.28) (2023-10-10)

### Bug Fixes

- use utility images ([fcc2856](https://gitlab.com/rxap/packages/commit/fcc2856257b0a9ef2babd647f0f1a14b23d3ca12))

# [16.1.0-dev.27](https://gitlab.com/rxap/packages/compare/@rxap/plugin-application@16.1.0-dev.26...@rxap/plugin-application@16.1.0-dev.27) (2023-10-03)

### Bug Fixes

- cleanup code generation ([9fca7e4](https://gitlab.com/rxap/packages/commit/9fca7e4aa89f11f08f824a8972f4a57e71decb28))

# [16.1.0-dev.26](https://gitlab.com/rxap/packages/compare/@rxap/plugin-application@16.1.0-dev.25...@rxap/plugin-application@16.1.0-dev.26) (2023-10-03)

### Bug Fixes

- ensure all required cacheable operations are defined ([49a9199](https://gitlab.com/rxap/packages/commit/49a9199cd2592cf8550650dc17f9995e4f6727f8))

# [16.1.0-dev.25](https://gitlab.com/rxap/packages/compare/@rxap/plugin-application@16.1.0-dev.24...@rxap/plugin-application@16.1.0-dev.25) (2023-10-02)

### Bug Fixes

- introduce Is\*Project functions ([0f4a53a](https://gitlab.com/rxap/packages/commit/0f4a53a2a68c7f854d819c005a30957d8b1cb3c6))

# [16.1.0-dev.24](https://gitlab.com/rxap/packages/compare/@rxap/plugin-application@16.1.0-dev.23...@rxap/plugin-application@16.1.0-dev.24) (2023-10-02)

### Bug Fixes

- ensure the correct docker image tag is used ([a1c30b9](https://gitlab.com/rxap/packages/commit/a1c30b9db5a25610dbe5427f0d90970de4069027))
- only add the image registry parameter if the $REGISTRY env is defined ([e9b6484](https://gitlab.com/rxap/packages/commit/e9b6484ddd5da5d3f232ec45f58ddf2869870ef0))

# [16.1.0-dev.23](https://gitlab.com/rxap/packages/compare/@rxap/plugin-application@16.1.0-dev.22...@rxap/plugin-application@16.1.0-dev.23) (2023-10-01)

### Bug Fixes

- set environment name to development for development configurations ([f1c2f35](https://gitlab.com/rxap/packages/commit/f1c2f35b87f91c21a69f32b54c0fa6340dd40da2))

# [16.1.0-dev.22](https://gitlab.com/rxap/packages/compare/@rxap/plugin-application@16.1.0-dev.21...@rxap/plugin-application@16.1.0-dev.22) (2023-09-28)

**Note:** Version bump only for package @rxap/plugin-application

# [16.1.0-dev.21](https://gitlab.com/rxap/packages/compare/@rxap/plugin-application@16.1.0-dev.20...@rxap/plugin-application@16.1.0-dev.21) (2023-09-27)

### Bug Fixes

- update utility scripts ([f09799a](https://gitlab.com/rxap/packages/commit/f09799a5f2d944193d1a39a095cd81405bf31de6))
- use the dep glob explicitly ([47ac6b7](https://gitlab.com/rxap/packages/commit/47ac6b79e390eaffadae3b13bf439f466b608f64))

### Features

- add docker compose generator files ([b2994bf](https://gitlab.com/rxap/packages/commit/b2994bf52dae8395f114a7a1fd45c8dc6e912fc3))

# [16.1.0-dev.20](https://gitlab.com/rxap/packages/compare/@rxap/plugin-application@16.1.0-dev.19...@rxap/plugin-application@16.1.0-dev.20) (2023-09-21)

### Bug Fixes

- add skip-projects flag ([0f45987](https://gitlab.com/rxap/packages/commit/0f45987bc9dd927b1ede9eb53256125fa0e33674))

# [16.1.0-dev.19](https://gitlab.com/rxap/packages/compare/@rxap/plugin-application@16.1.0-dev.18...@rxap/plugin-application@16.1.0-dev.19) (2023-09-18)

### Bug Fixes

- install required dependencies ([1eafe46](https://gitlab.com/rxap/packages/commit/1eafe462bcc0797340b52e3853ddffb49a5e584e))

# [16.1.0-dev.18](https://gitlab.com/rxap/packages/compare/@rxap/plugin-application@16.1.0-dev.17...@rxap/plugin-application@16.1.0-dev.18) (2023-09-18)

### Bug Fixes

- set default target options for docker and docker-save ([b22c5aa](https://gitlab.com/rxap/packages/commit/b22c5aadc95241baffd988ed6457f4899350567d))

# [16.1.0-dev.17](https://gitlab.com/rxap/packages/compare/@rxap/plugin-application@16.1.0-dev.16...@rxap/plugin-application@16.1.0-dev.17) (2023-09-18)

### Bug Fixes

- remove build info target ([bf30d66](https://gitlab.com/rxap/packages/commit/bf30d662c92eea4edcadb1fb1f35b683a2ae0587))

# [16.1.0-dev.16](https://gitlab.com/rxap/packages/compare/@rxap/plugin-application@16.1.0-dev.15...@rxap/plugin-application@16.1.0-dev.16) (2023-09-17)

### Bug Fixes

- split GuessOutputPath function ([5fc44e1](https://gitlab.com/rxap/packages/commit/5fc44e1470ca16b542e0b45049bfd9a83b8baab8))

# [16.1.0-dev.15](https://gitlab.com/rxap/packages/compare/@rxap/plugin-application@16.1.0-dev.14...@rxap/plugin-application@16.1.0-dev.15) (2023-09-12)

### Bug Fixes

- peer dependency issue ([e67e2b8](https://gitlab.com/rxap/packages/commit/e67e2b8eb884b598536d16c2c544a9ad9be5b53e))

# [16.1.0-dev.14](https://gitlab.com/rxap/packages/compare/@rxap/plugin-application@16.1.0-dev.13...@rxap/plugin-application@16.1.0-dev.14) (2023-09-12)

### Bug Fixes

- refactor the build.json concept ([7193cef](https://gitlab.com/rxap/packages/commit/7193cef9ffe76efdfedcd6e6d82e947c1be9c15b))

# [16.1.0-dev.13](https://gitlab.com/rxap/packages/compare/@rxap/plugin-application@16.1.0-dev.12...@rxap/plugin-application@16.1.0-dev.13) (2023-09-07)

**Note:** Version bump only for package @rxap/plugin-application

# [16.1.0-dev.12](https://gitlab.com/rxap/packages/compare/@rxap/plugin-application@16.1.0-dev.11...@rxap/plugin-application@16.1.0-dev.12) (2023-09-03)

**Note:** Version bump only for package @rxap/plugin-application

# [16.1.0-dev.11](https://gitlab.com/rxap/packages/compare/@rxap/plugin-application@16.1.0-dev.10...@rxap/plugin-application@16.1.0-dev.11) (2023-09-03)

**Note:** Version bump only for package @rxap/plugin-application

# [16.1.0-dev.10](https://gitlab.com/rxap/packages/compare/@rxap/plugin-application@16.1.0-dev.9...@rxap/plugin-application@16.1.0-dev.10) (2023-08-31)

### Bug Fixes

- ensure overwrite option is passed to sub schematics ([8472aab](https://gitlab.com/rxap/packages/commit/8472aab8814227c851fab9ae4c1b9ec3019d6f4e))
- ensure the project name is not included in the project tag list ([b131ac3](https://gitlab.com/rxap/packages/commit/b131ac3bd92b3b8799d62f15bbd30a1997d7c753))
- remove build info output formatting ([7071e00](https://gitlab.com/rxap/packages/commit/7071e00d5c8bf4ab15797718d32a97cc8e1c182f))

# [16.1.0-dev.9](https://gitlab.com/rxap/packages/compare/@rxap/plugin-application@16.1.0-dev.8...@rxap/plugin-application@16.1.0-dev.9) (2023-08-24)

### Bug Fixes

- ensure the build target is set correctly ([c40f328](https://gitlab.com/rxap/packages/commit/c40f328c35743b3309c593b28d7acf94b519c1fa))

# [16.1.0-dev.8](https://gitlab.com/rxap/packages/compare/@rxap/plugin-application@16.1.0-dev.7...@rxap/plugin-application@16.1.0-dev.8) (2023-08-17)

### Reverts

- change from commonjs to es2022 ([747a381](https://gitlab.com/rxap/packages/commit/747a381a090f0a276cf363da61bb19ed0c9cb5b7))

# [16.1.0-dev.7](https://gitlab.com/rxap/packages/compare/@rxap/plugin-application@16.1.0-dev.6...@rxap/plugin-application@16.1.0-dev.7) (2023-08-16)

### Bug Fixes

- change from commonjs to es2022 ([fd0f2ba](https://gitlab.com/rxap/packages/commit/fd0f2bae24eae7c854e96f630076cd5598c30be6))

# [16.1.0-dev.6](https://gitlab.com/rxap/packages/compare/@rxap/plugin-application@16.1.0-dev.5...@rxap/plugin-application@16.1.0-dev.6) (2023-08-15)

### Bug Fixes

- merge default configuration property with existing target ([807f1ae](https://gitlab.com/rxap/packages/commit/807f1aea4167d5a1ae11d60b7daaea1771ffc3bb))

# [16.1.0-dev.5](https://gitlab.com/rxap/packages/compare/@rxap/plugin-application@16.1.0-dev.4...@rxap/plugin-application@16.1.0-dev.5) (2023-08-14)

**Note:** Version bump only for package @rxap/plugin-application

# [16.1.0-dev.4](https://gitlab.com/rxap/packages/compare/@rxap/plugin-application@16.1.0-dev.3...@rxap/plugin-application@16.1.0-dev.4) (2023-08-06)

### Bug Fixes

- expose generators as schematics ([679ca36](https://gitlab.com/rxap/packages/commit/679ca36d3712a11e4dc838762bca2f7c471e1e04))

# [16.1.0-dev.3](https://gitlab.com/rxap/packages/compare/@rxap/plugin-application@16.1.0-dev.2...@rxap/plugin-application@16.1.0-dev.3) (2023-08-04)

### Bug Fixes

- call the nest init generator for nest projects ([bf08bb0](https://gitlab.com/rxap/packages/commit/bf08bb022dc064c7c5d84c890b5e422a196cea7d))

# [16.1.0-dev.2](https://gitlab.com/rxap/packages/compare/@rxap/plugin-application@16.1.0-dev.1...@rxap/plugin-application@16.1.0-dev.2) (2023-08-04)

### Bug Fixes

- add licence file to publishable packages ([ca6d4d5](https://gitlab.com/rxap/packages/commit/ca6d4d509a743b89bad5ed7ae935d3007231705a))
- enforce that the production configuration is the default configuration ([6e9c3b7](https://gitlab.com/rxap/packages/commit/6e9c3b7a58e92bcb5a1b9b772a34153b44acc8f9))
- remove the replace strategy ([2a6145f](https://gitlab.com/rxap/packages/commit/2a6145f5bc38300d9a7f1e818eb5c900e1e502dc))
- use proper docker image names ([df0af40](https://gitlab.com/rxap/packages/commit/df0af40b831b38d5eff1b22c8494961dd76278a1))

# [16.1.0-dev.1](https://gitlab.com/rxap/packages/compare/@rxap/plugin-application@16.1.0-dev.0...@rxap/plugin-application@16.1.0-dev.1) (2023-08-04)

### Bug Fixes

- generate readme with peer dependencies to install ([e7039bb](https://gitlab.com/rxap/packages/commit/e7039bb5e86ffeadfe7cc92d5fc71d32f8efb4fb))
- run gitlab ci generators on application init ([9a15981](https://gitlab.com/rxap/packages/commit/9a15981fd5b573db47259014b2582373867179f2))

# 16.1.0-dev.0 (2023-08-01)

### Bug Fixes

- use utility function to coerce default target dependencies ([afe5f53](https://gitlab.com/rxap/packages/commit/afe5f535383aab813dcaa88e5b25da874d190c12))

### Features

- run build-info target before serve and ignore build.json files in source root folder ([ed4dbc0](https://gitlab.com/rxap/packages/commit/ed4dbc059db077d262da457f4c4dce793574c60d))

## 16.0.1-dev.0 (2023-07-20)

**Note:** Version bump only for package @rxap/plugin-application
