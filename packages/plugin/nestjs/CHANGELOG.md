# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [16.1.0-dev.41](https://gitlab.com/rxap/packages/compare/@rxap/plugin-nestjs@16.1.0-dev.40...@rxap/plugin-nestjs@16.1.0-dev.41) (2023-10-11)

### Bug Fixes

- fail with manuel action instructions ([94dee1f](https://gitlab.com/rxap/packages/commit/94dee1f89ac92d309e31d04629452ef468adf832))

# 16.1.0-dev.40 (2023-10-11)

### Bug Fixes

- add development configuration to build target ([676142f](https://gitlab.com/rxap/packages/commit/676142f78571b9f4ae47c78e61448b114f98ba38))
- add implicit dependencies between openapi client sdk project and the service project ([d2910cd](https://gitlab.com/rxap/packages/commit/d2910cdce7396665ed271952409ff4cc58a3f5cf))
- add licence file to publishable packages ([d7de1cb](https://gitlab.com/rxap/packages/commit/d7de1cb9db1bd1628f37084e3b0ffd1755aa75f6))
- add missing template property ([3a92a50](https://gitlab.com/rxap/packages/commit/3a92a50c201c18520b56c780df0fe3d797537fa3))
- add project ts-morph ([fda78f5](https://gitlab.com/rxap/packages/commit/fda78f5ed61caac6dc5c4d9a70afd3aced6a05fa))
- add ROOT_DOMAIN default env value ([bce5c91](https://gitlab.com/rxap/packages/commit/bce5c91c0face19e59c8e145b5b7e4cecf268089))
- add skip-projects flag ([e1f31ed](https://gitlab.com/rxap/packages/commit/e1f31ed837646f605ced82a52749e62af07ba939))
- change from commonjs to es2022 ([cf675a7](https://gitlab.com/rxap/packages/commit/cf675a7254de9ce4b269264df59794dd42fcbd8b))
- convert directory into project name prefix ([d2f0c19](https://gitlab.com/rxap/packages/commit/d2f0c19aa2fa798be5657f333c991a1af2e05408))
- create an info path for the default app controller ([7c54f5d](https://gitlab.com/rxap/packages/commit/7c54f5d569551c79042b2f8db437da6530d87d74))
- create health files if not exist ([60e7b63](https://gitlab.com/rxap/packages/commit/60e7b63919ab35eb3a546112eaf0f69cdecbb233))
- default status service base url var generation ([46125dd](https://gitlab.com/rxap/packages/commit/46125dd161db5eac87f5fea4fdb47ac61bc469a6))
- ensure all required cacheable operations are defined ([d9ded9c](https://gitlab.com/rxap/packages/commit/d9ded9c5e150d9781ce490ad7ac292194d09bf2a))
- ensure changes to the openapi client sdk project configuration are written to disk ([e0e6821](https://gitlab.com/rxap/packages/commit/e0e68211f160f79609fe62a81f66d713c1432bbc))
- ensure extraction works in new module structure ([c646866](https://gitlab.com/rxap/packages/commit/c646866cbb55d08d6a2dd7207c683578bdfd0105))
- ensure options are passed to the microservice generator ([3c4dfe0](https://gitlab.com/rxap/packages/commit/3c4dfe090f9f9b6b62abc3ea83a47d37a18cf52b))
- ensure overwrite option is passed to sub schematics ([0c8a19b](https://gitlab.com/rxap/packages/commit/0c8a19b5166f804aa335f739a00a5415bd97f61a))
- ensure project tags ([4a59b94](https://gitlab.com/rxap/packages/commit/4a59b94526ea0ed16216b1b8001a694ac7a8bea4))
- ensure projects are buildable or publishable ([354400b](https://gitlab.com/rxap/packages/commit/354400bd7b012e67801f8986ae4a05b40ef44d4a))
- ensure the apiConfigurationFile is defined ([09f9432](https://gitlab.com/rxap/packages/commit/09f9432bf20c20de29eb510b5b61db68f56bd306))
- ensure the env replacement for nest application is defined ([beccd3f](https://gitlab.com/rxap/packages/commit/beccd3f67df21ca60d696a7fe69445875c14a2c3))
- ensure the project name is not included in the project tag list ([46d4479](https://gitlab.com/rxap/packages/commit/46d44798258ea1b20df9d4408b9c0809f55027b2))
- ensure the project specific api prefix is used ([4e977a6](https://gitlab.com/rxap/packages/commit/4e977a6469c9f0537ef32c81c8adec34c34bcec9))
- expose generators as schematics ([8a58d07](https://gitlab.com/rxap/packages/commit/8a58d07c2f1dcfff75e724a418d7c3bddb2d0bbc))
- generate readme with peer dependencies to install ([27c2cd7](https://gitlab.com/rxap/packages/commit/27c2cd7d98f0c8a499b8c30719f49d69e4970ae9))
- import SentryOptionsFactory from the correct package ([001abfe](https://gitlab.com/rxap/packages/commit/001abfeba6c5adbdfd6a17748f1d0bc15b8aaee1))
- improve nest application init generator execution ([c41c348](https://gitlab.com/rxap/packages/commit/c41c348aaa0814e0567bf5270d242692ab735b51))
- install required dependencies ([c98eb72](https://gitlab.com/rxap/packages/commit/c98eb72f284d2645b882f266b1a5887392df2ba2))
- install required dependencies ([a416b24](https://gitlab.com/rxap/packages/commit/a416b24af4cedbb63218de1402e5cbb2ccaf68d9))
- install required dependencies ([859be87](https://gitlab.com/rxap/packages/commit/859be8766fbb20cb2c38c5e71ac3037286d59f0c))
- introduce Is\*Project functions ([3c9f251](https://gitlab.com/rxap/packages/commit/3c9f251f1d7be46ca366171e79e86ef2764fa3b0))
- introduce more Is\*Project functions ([41a3713](https://gitlab.com/rxap/packages/commit/41a3713e2965f46900e80902a455b62e08686989))
- move forRoot logic into detected loader classes ([45812d6](https://gitlab.com/rxap/packages/commit/45812d66901f37130ec4018b0bc9369829800155))
- only skip swagger configuration if explicit disabled ([b86fbff](https://gitlab.com/rxap/packages/commit/b86fbff8b6fabed940247abf25e8d611400fce26))
- pass overwrite option to utility function ([2b94b6d](https://gitlab.com/rxap/packages/commit/2b94b6d74c531c0d3d8655cfeb661053073779e1))
- peer dependency issue ([ee95415](https://gitlab.com/rxap/packages/commit/ee95415370d9ef2396916d6c25061a0df791034a))
- remove coerce default root domain ([20809c7](https://gitlab.com/rxap/packages/commit/20809c72bcca2b31bd6afdc53641e99fd9666899))
- remove generate file call ([ee235d5](https://gitlab.com/rxap/packages/commit/ee235d50713485e6b84e3735e7dee2a80f23e979))
- remove support for open-api client sdk packages ([0015878](https://gitlab.com/rxap/packages/commit/0015878e53cba42943d37354ef5c7d5f17828fd7))
- resolve issues ([602183d](https://gitlab.com/rxap/packages/commit/602183d93528a28773e05b7a983110bafb93a2f2))
- respect the overwrite flag ([efd7313](https://gitlab.com/rxap/packages/commit/efd7313bcb14886043d5cfd646a5542d6162312c))
- restore existing config validation ([3e3b92d](https://gitlab.com/rxap/packages/commit/3e3b92df3d183cc617bc0c3f70fb309f04fba0aa))
- set correct default publishable library package json version ([c942e51](https://gitlab.com/rxap/packages/commit/c942e5152a19e33cf9881106879eb2df20ef723b))
- set correct schema types ([c9d14da](https://gitlab.com/rxap/packages/commit/c9d14da08492f1d486b448ad96ff35ce92077a5b))
- set default throttler ttl to 1 ([6fd02aa](https://gitlab.com/rxap/packages/commit/6fd02aac633fde34cba8d66cc5e373b7eff9dc79))
- set required defaults for nestjs microservice init ([04463ec](https://gitlab.com/rxap/packages/commit/04463ec95cdc1265861a6b27f5532db1921fa677))
- skip plugin or schematic projects ([8953299](https://gitlab.com/rxap/packages/commit/89532993198c32bc25e5008748db385f6cee25a7))
- soft fail for library generation ([8d69e69](https://gitlab.com/rxap/packages/commit/8d69e69464e25c90d9cfb9e709fd0cde1fce0f7e))
- streamline the nestjs application initialization ([d5cc807](https://gitlab.com/rxap/packages/commit/d5cc8079d3ae542c988904fc7f0cc7a63dd7d2f0))
- support config validation overwrite ([bf9fc5d](https://gitlab.com/rxap/packages/commit/bf9fc5dcdb961d7583114e88abfe7ba0340df0f8))
- support dynamic label definition ([b284395](https://gitlab.com/rxap/packages/commit/b284395f0a1630a6b2f1310886ef4009f5523079))
- support dynamic server config loading ([17f73ab](https://gitlab.com/rxap/packages/commit/17f73aba524837a8e21f85b84d5cef8b2fe1e99b))
- support overwrite of default docker file ([4289d2b](https://gitlab.com/rxap/packages/commit/4289d2bd1cf184fc68766804d0c729a2773803be))
- update service status name ([595cd07](https://gitlab.com/rxap/packages/commit/595cd07ab522dc1818c6f275e7a526e6b31d63ac))
- update the application configuration file with the service api prefix ([86f0779](https://gitlab.com/rxap/packages/commit/86f0779339f21b786f894fa13685a504f6ad8bf3))
- use es module import style ([f41dbf7](https://gitlab.com/rxap/packages/commit/f41dbf754efa7e80d7277d1c8fb9aafe6aad6812))
- use function CoerceNxJsonCacheableOperation ([485e598](https://gitlab.com/rxap/packages/commit/485e598e7a1192b5635f6c54dee5349b9d2889c3))
- use local status server if possible ([4f498cd](https://gitlab.com/rxap/packages/commit/4f498cd2297e6b30e3962a1356a45e714982bec0))
- use ready hook for RegisterToStatusService ([072800b](https://gitlab.com/rxap/packages/commit/072800bd171a3e01773fe30942ea0c079065edb8))
- use the new status service hostname ([c59a0aa](https://gitlab.com/rxap/packages/commit/c59a0aae38e34a43d3ebfea36fd4ce128e865702))
- use the plugin-open-api project for client sdk generation ([734aa70](https://gitlab.com/rxap/packages/commit/734aa70f1a319bc2f9f42f6e1607b3aa57ce66b3))
- use unified Dockerfile ([506344a](https://gitlab.com/rxap/packages/commit/506344a573dd20a3054fe846e8b7a9556be2b788))

### Features

- add feature-microservice generator ([12f91f3](https://gitlab.com/rxap/packages/commit/12f91f36bb33552ebf56c8684d22e9ff4f7ef13f))
- add frontend-microservice generator ([ba67aea](https://gitlab.com/rxap/packages/commit/ba67aea0604a7a63ad73c1129a666026d73aca1e))
- add generate-open-api target to nestjs application projects ([24e804e](https://gitlab.com/rxap/packages/commit/24e804e80e44af186177454176e990ef92e2a212))
- add microservice generator ([c421e01](https://gitlab.com/rxap/packages/commit/c421e015cc7e8677664e8de1b2ee2f6b39e324d5))
- add openapi utility operation generation ([648b8ef](https://gitlab.com/rxap/packages/commit/648b8ef7a4fa521e4baf7362e443799f8718f401))
- add project json generator executor ([b4cd0cd](https://gitlab.com/rxap/packages/commit/b4cd0cd4d63521d37873d33d8ebe2f2a71202ec2))
- add the health indicator generator ([20b45b6](https://gitlab.com/rxap/packages/commit/20b45b6609a2dcd2eadd8c73a6a27501451bfc64))
- add the jwt generator ([ca9a3b3](https://gitlab.com/rxap/packages/commit/ca9a3b3e1f08dc7a54f8b19e4b4382d2ffa34053))
- add the mandatory app property to the environment object ([cfcb308](https://gitlab.com/rxap/packages/commit/cfcb3082c1f49295fe582bfdc057e17e2fff4804))
- add the open-api generator ([6500d77](https://gitlab.com/rxap/packages/commit/6500d778bca2fda5e18fe0732409b0664cf054d1))
- add the sentry generator ([dccb2fb](https://gitlab.com/rxap/packages/commit/dccb2fb1107ae34d440a25cb96d285d5b5bc3c65))
- add the validator generator ([6d64321](https://gitlab.com/rxap/packages/commit/6d64321501f1898d7094709c02a541cb8f2458c9))
- exclude health path from global api prefix ([023456b](https://gitlab.com/rxap/packages/commit/023456b9dae37372f2b1f0a8e6efadf285973010))
- generate status registry feature ([1eac350](https://gitlab.com/rxap/packages/commit/1eac350be642ce3f97671ac109950f2b5fdb6b96))
- **init-application:** add nest init application generator ([1d8af26](https://gitlab.com/rxap/packages/commit/1d8af264653885a907d8ffaff04d40e287e2a047))
- **init-library:** add nest init library generator ([8eb5b77](https://gitlab.com/rxap/packages/commit/8eb5b77685e7fa9d077398b742dc385ef5ddfd9f))
- **init:** add nest init generator ([e44ec06](https://gitlab.com/rxap/packages/commit/e44ec06239befc0aeaa4e2c8a34e46d041ff8ca6))
- mv swagger generator to plugin-nestjs ([895cba5](https://gitlab.com/rxap/packages/commit/895cba5d040262ae64f05ff14b604871240a0a4b))
- support open-api package project generation ([375681f](https://gitlab.com/rxap/packages/commit/375681f057e54879fa9fa2d8ba245da5163c0e65))
- use GetNestApiPrefix utility function ([7a1561c](https://gitlab.com/rxap/packages/commit/7a1561c24dbdcffdc5dfd5d3ba9d67c51264c345))

### Reverts

- "build: use nx run commands to build openapi.json" ([4485777](https://gitlab.com/rxap/packages/commit/44857779f20cd6264cb7e1b426988b5b91dc6649))
- change from commonjs to es2022 ([50eca61](https://gitlab.com/rxap/packages/commit/50eca61e9a89388d1cfeefb8b1029b302b6f307e))

# [16.1.0-dev.39](https://gitlab.com/rxap/packages/compare/@rxap/plugin-nestjs@16.1.0-dev.38...@rxap/plugin-nestjs@16.1.0-dev.39) (2023-10-10)

### Bug Fixes

- support dynamic label definition ([58022a3](https://gitlab.com/rxap/packages/commit/58022a39496f1a75cf8599c54b119ec02c02ee62))
- support overwrite of default docker file ([7ac132f](https://gitlab.com/rxap/packages/commit/7ac132faf705795b79d3c7ad5c88d115a3a62276))

### Features

- use GetNestApiPrefix utility function ([24c5c9f](https://gitlab.com/rxap/packages/commit/24c5c9f6f28a7bba17b17b0175afe40e399d518f))

# [16.1.0-dev.38](https://gitlab.com/rxap/packages/compare/@rxap/plugin-nestjs@16.1.0-dev.37...@rxap/plugin-nestjs@16.1.0-dev.38) (2023-10-03)

### Bug Fixes

- ensure all required cacheable operations are defined ([49a9199](https://gitlab.com/rxap/packages/commit/49a9199cd2592cf8550650dc17f9995e4f6727f8))

# [16.1.0-dev.37](https://gitlab.com/rxap/packages/compare/@rxap/plugin-nestjs@16.1.0-dev.36...@rxap/plugin-nestjs@16.1.0-dev.37) (2023-10-02)

### Bug Fixes

- set correct default publishable library package json version ([32c032d](https://gitlab.com/rxap/packages/commit/32c032dd47552dc53f5adbc39af0ef2a074beea6))
- use function CoerceNxJsonCacheableOperation ([14f26b0](https://gitlab.com/rxap/packages/commit/14f26b0d679f5d1208a23ae20d6d9f6f4516a60d))

# [16.1.0-dev.36](https://gitlab.com/rxap/packages/compare/@rxap/plugin-nestjs@16.1.0-dev.35...@rxap/plugin-nestjs@16.1.0-dev.36) (2023-10-02)

### Bug Fixes

- introduce Is\*Project functions ([0f4a53a](https://gitlab.com/rxap/packages/commit/0f4a53a2a68c7f854d819c005a30957d8b1cb3c6))
- introduce more Is\*Project functions ([8d37211](https://gitlab.com/rxap/packages/commit/8d37211fb1906f90d7176cfcfe43f755f04a0fa6))

# [16.1.0-dev.35](https://gitlab.com/rxap/packages/compare/@rxap/plugin-nestjs@16.1.0-dev.34...@rxap/plugin-nestjs@16.1.0-dev.35) (2023-10-02)

### Bug Fixes

- ensure options are passed to the microservice generator ([0d048cf](https://gitlab.com/rxap/packages/commit/0d048cf25a258107c38a9f52b96415331125ba56))
- ensure the project specific api prefix is used ([85327a4](https://gitlab.com/rxap/packages/commit/85327a40e26fe6e46bff0961bf91044e3cd4c59c))

# [16.1.0-dev.34](https://gitlab.com/rxap/packages/compare/@rxap/plugin-nestjs@16.1.0-dev.33...@rxap/plugin-nestjs@16.1.0-dev.34) (2023-10-02)

### Bug Fixes

- ensure changes to the openapi client sdk project configuration are written to disk ([f68ee6c](https://gitlab.com/rxap/packages/commit/f68ee6cb01155dfb8195f13dc311a1877f40a385))

# [16.1.0-dev.33](https://gitlab.com/rxap/packages/compare/@rxap/plugin-nestjs@16.1.0-dev.32...@rxap/plugin-nestjs@16.1.0-dev.33) (2023-10-02)

### Bug Fixes

- add implicit dependencies between openapi client sdk project and the service project ([0762167](https://gitlab.com/rxap/packages/commit/07621678af18ae73068270e506f4c14863d8a5a0))
- set required defaults for nestjs microservice init ([c49215d](https://gitlab.com/rxap/packages/commit/c49215d6c854edbc49e03e126c90358326c16ea3))

# [16.1.0-dev.32](https://gitlab.com/rxap/packages/compare/@rxap/plugin-nestjs@16.1.0-dev.31...@rxap/plugin-nestjs@16.1.0-dev.32) (2023-10-02)

### Bug Fixes

- convert directory into project name prefix ([97d743d](https://gitlab.com/rxap/packages/commit/97d743dfc500232aa3ee505fe0eaffc24af8ed30))
- ensure the apiConfigurationFile is defined ([ec22d23](https://gitlab.com/rxap/packages/commit/ec22d234d9a207803ca093cf55488d89280d7aeb))
- import SentryOptionsFactory from the correct package ([23243db](https://gitlab.com/rxap/packages/commit/23243db072efb24c543421c049a656f10c592d92))
- move forRoot logic into detected loader classes ([01796e0](https://gitlab.com/rxap/packages/commit/01796e0898a3dee4e365278a73029dd023093136))
- remove coerce default root domain ([8092172](https://gitlab.com/rxap/packages/commit/809217280ba95cf2132c6a5b0cb262687b5aee81))
- update the application configuration file with the service api prefix ([b9bbc58](https://gitlab.com/rxap/packages/commit/b9bbc58573e0fc885da765da71abd6b0ae2c4613))

### Features

- add feature-microservice generator ([4aed057](https://gitlab.com/rxap/packages/commit/4aed057737303429cd543008d9a2947f3756bca2))
- add frontend-microservice generator ([444e758](https://gitlab.com/rxap/packages/commit/444e7585d4a1c8c3fe2528671ef7948bad1323be))
- add microservice generator ([a2d46fc](https://gitlab.com/rxap/packages/commit/a2d46fc4c718d365346e243d899eb35d458900ac))

# [16.1.0-dev.31](https://gitlab.com/rxap/packages/compare/@rxap/plugin-nestjs@16.1.0-dev.30...@rxap/plugin-nestjs@16.1.0-dev.31) (2023-09-28)

### Bug Fixes

- add ROOT_DOMAIN default env value ([9465f3d](https://gitlab.com/rxap/packages/commit/9465f3d44e4882e364c7c105420604b268bf271f))

# [16.1.0-dev.30](https://gitlab.com/rxap/packages/compare/@rxap/plugin-nestjs@16.1.0-dev.29...@rxap/plugin-nestjs@16.1.0-dev.30) (2023-09-21)

### Bug Fixes

- add skip-projects flag ([0f45987](https://gitlab.com/rxap/packages/commit/0f45987bc9dd927b1ede9eb53256125fa0e33674))

# [16.1.0-dev.29](https://gitlab.com/rxap/packages/compare/@rxap/plugin-nestjs@16.1.0-dev.28...@rxap/plugin-nestjs@16.1.0-dev.29) (2023-09-19)

### Bug Fixes

- support dynamic server config loading ([088583a](https://gitlab.com/rxap/packages/commit/088583acece9a693a461c958af3fa27cb20d661f))

# [16.1.0-dev.28](https://gitlab.com/rxap/packages/compare/@rxap/plugin-nestjs@16.1.0-dev.27...@rxap/plugin-nestjs@16.1.0-dev.28) (2023-09-18)

### Bug Fixes

- install required dependencies ([2ec480a](https://gitlab.com/rxap/packages/commit/2ec480a2080d2be7aeb18b27dc9efb2ddc87835f))

# [16.1.0-dev.27](https://gitlab.com/rxap/packages/compare/@rxap/plugin-nestjs@16.1.0-dev.26...@rxap/plugin-nestjs@16.1.0-dev.27) (2023-09-18)

### Bug Fixes

- install required dependencies ([1eafe46](https://gitlab.com/rxap/packages/commit/1eafe462bcc0797340b52e3853ddffb49a5e584e))

# [16.1.0-dev.26](https://gitlab.com/rxap/packages/compare/@rxap/plugin-nestjs@16.1.0-dev.25...@rxap/plugin-nestjs@16.1.0-dev.26) (2023-09-18)

### Bug Fixes

- ensure project tags ([f644ed7](https://gitlab.com/rxap/packages/commit/f644ed7191bb89fa6d45ae53ed61c7ff0f36ab8a))

# [16.1.0-dev.25](https://gitlab.com/rxap/packages/compare/@rxap/plugin-nestjs@16.1.0-dev.24...@rxap/plugin-nestjs@16.1.0-dev.25) (2023-09-18)

### Bug Fixes

- install required dependencies ([3c86754](https://gitlab.com/rxap/packages/commit/3c867542bdc88c781f3894761b2a284955d9f7c4))

# [16.1.0-dev.24](https://gitlab.com/rxap/packages/compare/@rxap/plugin-nestjs@16.1.0-dev.23...@rxap/plugin-nestjs@16.1.0-dev.24) (2023-09-18)

### Bug Fixes

- update service status name ([238353c](https://gitlab.com/rxap/packages/commit/238353c821f25268af93599756406e73431fca21))

# [16.1.0-dev.23](https://gitlab.com/rxap/packages/compare/@rxap/plugin-nestjs@16.1.0-dev.22...@rxap/plugin-nestjs@16.1.0-dev.23) (2023-09-12)

### Bug Fixes

- ensure extraction works in new module structure ([bc421d7](https://gitlab.com/rxap/packages/commit/bc421d74643e15d55b2b74c930ddc32e3a601d03))

# [16.1.0-dev.22](https://gitlab.com/rxap/packages/compare/@rxap/plugin-nestjs@16.1.0-dev.21...@rxap/plugin-nestjs@16.1.0-dev.22) (2023-09-12)

### Bug Fixes

- remove generate file call ([dc7d904](https://gitlab.com/rxap/packages/commit/dc7d9042abb02dbad0b006aee71c508300a5fa17))

# [16.1.0-dev.21](https://gitlab.com/rxap/packages/compare/@rxap/plugin-nestjs@16.1.0-dev.20...@rxap/plugin-nestjs@16.1.0-dev.21) (2023-09-12)

### Bug Fixes

- restore existing config validation ([88feca5](https://gitlab.com/rxap/packages/commit/88feca56b0209f5fdfd649321606414ba66756ab))

# [16.1.0-dev.20](https://gitlab.com/rxap/packages/compare/@rxap/plugin-nestjs@16.1.0-dev.19...@rxap/plugin-nestjs@16.1.0-dev.20) (2023-09-12)

### Bug Fixes

- peer dependency issue ([e67e2b8](https://gitlab.com/rxap/packages/commit/e67e2b8eb884b598536d16c2c544a9ad9be5b53e))

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
