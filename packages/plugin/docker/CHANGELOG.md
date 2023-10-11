# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [16.0.0-dev.40](https://gitlab.com/rxap/packages/compare/@rxap/plugin-docker@16.0.0-dev.39...@rxap/plugin-docker@16.0.0-dev.40) (2023-10-11)

**Note:** Version bump only for package @rxap/plugin-docker

# [16.0.0-dev.39](https://gitlab.com/rxap/packages/compare/@rxap/plugin-docker@16.0.0-dev.38...@rxap/plugin-docker@16.0.0-dev.39) (2023-10-11)

### Bug Fixes

- ensure overwrite option is respected ([672c315](https://gitlab.com/rxap/packages/commit/672c3152403ae577fb8d4d34e060971d2e53d0af))

# [16.0.0-dev.38](https://gitlab.com/rxap/packages/compare/@rxap/plugin-docker@16.0.0-dev.5...@rxap/plugin-docker@16.0.0-dev.38) (2023-10-11)

### Bug Fixes

- add default stage for docker build job ([80fb089](https://gitlab.com/rxap/packages/commit/80fb0890533e12af2f00f30e4cfb554d4f9a2361))
- add GIT_LFS_SKIP_SMUDGE env to docker builds ([7f0feef](https://gitlab.com/rxap/packages/commit/7f0feefff5806b8e31658bc74d8ac64302dcfead))
- add licence file to publishable packages ([d7de1cb](https://gitlab.com/rxap/packages/commit/d7de1cb9db1bd1628f37084e3b0ffd1755aa75f6))
- add missing docker build arguments ([2cd4a40](https://gitlab.com/rxap/packages/commit/2cd4a4027c6a7772d541dd2abdc900f8af77226f))
- add missing echo -e ([d75ea18](https://gitlab.com/rxap/packages/commit/d75ea182589f9bf154098ba2359c1732863d5ca8))
- add missing job tags ([0ad32ca](https://gitlab.com/rxap/packages/commit/0ad32cab8439370bae80cfbd8a1abc173c8447fb))
- change from commonjs to es2022 ([cf675a7](https://gitlab.com/rxap/packages/commit/cf675a7254de9ce4b269264df59794dd42fcbd8b))
- copy docker options to gitlab ci configuration ([b1995ba](https://gitlab.com/rxap/packages/commit/b1995ba3594acde53b802f67564731e3f1eaf7df))
- create startup configuration tailed to the project type ([5b81b29](https://gitlab.com/rxap/packages/commit/5b81b29343e92d370811e090c1b7b4a0125d80ab))
- ensure docker file has an absolute path ([550dec6](https://gitlab.com/rxap/packages/commit/550dec6f7e7e741ab2f1ee6f29d932f38e733384))
- ensure the project name is not included in the project tag list ([46d4479](https://gitlab.com/rxap/packages/commit/46d44798258ea1b20df9d4408b9c0809f55027b2))
- expose generators as schematics ([8a58d07](https://gitlab.com/rxap/packages/commit/8a58d07c2f1dcfff75e724a418d7c3bddb2d0bbc))
- generate readme with peer dependencies to install ([27c2cd7](https://gitlab.com/rxap/packages/commit/27c2cd7d98f0c8a499b8c30719f49d69e4970ae9))
- introduce more Is\*Project functions ([41a3713](https://gitlab.com/rxap/packages/commit/41a3713e2965f46900e80902a455b62e08686989))
- only add the env name to the template job ([f596ca2](https://gitlab.com/rxap/packages/commit/f596ca2d9a447f87ac9d2985f58ceeb888c86f28))
- peer dependency issue ([ee95415](https://gitlab.com/rxap/packages/commit/ee95415370d9ef2396916d6c25061a0df791034a))
- print executor options ([ca3b913](https://gitlab.com/rxap/packages/commit/ca3b913aab7a1d802b7cfd3d158ce1a8b48cb44b))
- reduce logging ([20a7c6b](https://gitlab.com/rxap/packages/commit/20a7c6bafff55c9763a0aab0e4adfdadb42fef2a))
- remove quotes around command parameters ([3408584](https://gitlab.com/rxap/packages/commit/34085848d626e7c3812064f3d41f7e420a2bcc9e))
- remove slashes from docker tag ([7c982c6](https://gitlab.com/rxap/packages/commit/7c982c66d9ff7393140f6fa0dc1774beb84815af))
- remove unnecessary deployment tier ([be4c65a](https://gitlab.com/rxap/packages/commit/be4c65a7d1d5dc9c02e6bda8ac6fba6a0c21cd96))
- run gitlab ci generators on application init ([84f804f](https://gitlab.com/rxap/packages/commit/84f804fb533ac84f80a708cff8c1b8c78f23707c))
- split GuessOutputPath function ([470b93a](https://gitlab.com/rxap/packages/commit/470b93a97a44b11435ff045c79896d712c9721a9))
- support custom docker context ([1600544](https://gitlab.com/rxap/packages/commit/160054491429bd5116e2e112d1d2585b5e5f1386))
- support docker options from nx.json file ([931ffdc](https://gitlab.com/rxap/packages/commit/931ffdc960f4fb0c92fcbff1a5b1966df7fd074e))
- use current branch name as fallback docker tag ([fb227b1](https://gitlab.com/rxap/packages/commit/fb227b15c9cfacacae2061be9d5271fac4e77900))
- use shared Dockerfile for angular projects ([15bc009](https://gitlab.com/rxap/packages/commit/15bc0098603d0815ca0b164d64147e8cca986cd7))
- use startup instead of setup as base job ([90dd6c1](https://gitlab.com/rxap/packages/commit/90dd6c1cf8424d1badd1ba3d67aa7a8fb7b07e06))

### Features

- generate startup test jobs ([03f692c](https://gitlab.com/rxap/packages/commit/03f692c7d2c7c25f3dbbbd755548f9767bc3fe74))
- **gitlab-ci:** add generator ([2b50891](https://gitlab.com/rxap/packages/commit/2b508918d82dc7e6979a5126590e94f2b753bc58))

### Reverts

- change from commonjs to es2022 ([50eca61](https://gitlab.com/rxap/packages/commit/50eca61e9a89388d1cfeefb8b1029b302b6f307e))

# [16.0.0-dev.37](https://gitlab.com/rxap/packages/compare/@rxap/plugin-docker@16.0.0-dev.36...@rxap/plugin-docker@16.0.0-dev.37) (2023-10-10)

### Bug Fixes

- add missing docker build arguments ([a99cf1d](https://gitlab.com/rxap/packages/commit/a99cf1d661ec86d947f0e6980e895aafdce435e8))

# [16.0.0-dev.36](https://gitlab.com/rxap/packages/compare/@rxap/plugin-docker@16.0.0-dev.35...@rxap/plugin-docker@16.0.0-dev.36) (2023-10-03)

### Bug Fixes

- reduce logging ([07e2298](https://gitlab.com/rxap/packages/commit/07e22987fa53d7726fa5fc73e973d0f1c972b1fe))

# [16.0.0-dev.35](https://gitlab.com/rxap/packages/compare/@rxap/plugin-docker@16.0.0-dev.34...@rxap/plugin-docker@16.0.0-dev.35) (2023-10-02)

### Bug Fixes

- introduce more Is\*Project functions ([8d37211](https://gitlab.com/rxap/packages/commit/8d37211fb1906f90d7176cfcfe43f755f04a0fa6))

# [16.0.0-dev.34](https://gitlab.com/rxap/packages/compare/@rxap/plugin-docker@16.0.0-dev.33...@rxap/plugin-docker@16.0.0-dev.34) (2023-10-02)

### Bug Fixes

- print executor options ([8bcd4bf](https://gitlab.com/rxap/packages/commit/8bcd4bf2d005523176d1d1f6a36c59bb0c1d0bf1))

# [16.0.0-dev.33](https://gitlab.com/rxap/packages/compare/@rxap/plugin-docker@16.0.0-dev.32...@rxap/plugin-docker@16.0.0-dev.33) (2023-10-01)

### Bug Fixes

- create startup configuration tailed to the project type ([7fc3de4](https://gitlab.com/rxap/packages/commit/7fc3de4fa0d7cf1a01c6dcc292e75eb96ce5f716))

# [16.0.0-dev.32](https://gitlab.com/rxap/packages/compare/@rxap/plugin-docker@16.0.0-dev.31...@rxap/plugin-docker@16.0.0-dev.32) (2023-09-29)

### Bug Fixes

- use startup instead of setup as base job ([5437ac9](https://gitlab.com/rxap/packages/commit/5437ac9eee7d95a18359b92e010af4af98f84275))

# [16.0.0-dev.31](https://gitlab.com/rxap/packages/compare/@rxap/plugin-docker@16.0.0-dev.30...@rxap/plugin-docker@16.0.0-dev.31) (2023-09-28)

### Features

- generate startup test jobs ([11ed4a7](https://gitlab.com/rxap/packages/commit/11ed4a7b67c30d665e1b8f903d762e8b15e4f853))

# [16.0.0-dev.30](https://gitlab.com/rxap/packages/compare/@rxap/plugin-docker@16.0.0-dev.29...@rxap/plugin-docker@16.0.0-dev.30) (2023-09-28)

### Bug Fixes

- only add the env name to the template job ([f1f4c5b](https://gitlab.com/rxap/packages/commit/f1f4c5b8e34dbbaaf99e0d8eea8ffab5140c418c))

# [16.0.0-dev.29](https://gitlab.com/rxap/packages/compare/@rxap/plugin-docker@16.0.0-dev.28...@rxap/plugin-docker@16.0.0-dev.29) (2023-09-27)

**Note:** Version bump only for package @rxap/plugin-docker

# [16.0.0-dev.28](https://gitlab.com/rxap/packages/compare/@rxap/plugin-docker@16.0.0-dev.27...@rxap/plugin-docker@16.0.0-dev.28) (2023-09-19)

### Bug Fixes

- add GIT_LFS_SKIP_SMUDGE env to docker builds ([10ca99d](https://gitlab.com/rxap/packages/commit/10ca99d5906d0e22283b6791d996498789d6c77e))

# [16.0.0-dev.27](https://gitlab.com/rxap/packages/compare/@rxap/plugin-docker@16.0.0-dev.26...@rxap/plugin-docker@16.0.0-dev.27) (2023-09-17)

### Bug Fixes

- split GuessOutputPath function ([5fc44e1](https://gitlab.com/rxap/packages/commit/5fc44e1470ca16b542e0b45049bfd9a83b8baab8))

# [16.0.0-dev.26](https://gitlab.com/rxap/packages/compare/@rxap/plugin-docker@16.0.0-dev.25...@rxap/plugin-docker@16.0.0-dev.26) (2023-09-15)

### Bug Fixes

- support custom docker context ([43704f5](https://gitlab.com/rxap/packages/commit/43704f5daec5023e722df62732fd14e7de8ea52e))

# [16.0.0-dev.25](https://gitlab.com/rxap/packages/compare/@rxap/plugin-docker@16.0.0-dev.24...@rxap/plugin-docker@16.0.0-dev.25) (2023-09-12)

### Bug Fixes

- peer dependency issue ([e67e2b8](https://gitlab.com/rxap/packages/commit/e67e2b8eb884b598536d16c2c544a9ad9be5b53e))

# [16.0.0-dev.24](https://gitlab.com/rxap/packages/compare/@rxap/plugin-docker@16.0.0-dev.23...@rxap/plugin-docker@16.0.0-dev.24) (2023-09-12)

**Note:** Version bump only for package @rxap/plugin-docker

# [16.0.0-dev.23](https://gitlab.com/rxap/packages/compare/@rxap/plugin-docker@16.0.0-dev.22...@rxap/plugin-docker@16.0.0-dev.23) (2023-09-12)

**Note:** Version bump only for package @rxap/plugin-docker

# [16.0.0-dev.22](https://gitlab.com/rxap/packages/compare/@rxap/plugin-docker@16.0.0-dev.21...@rxap/plugin-docker@16.0.0-dev.22) (2023-09-07)

**Note:** Version bump only for package @rxap/plugin-docker

# [16.0.0-dev.21](https://gitlab.com/rxap/packages/compare/@rxap/plugin-docker@16.0.0-dev.20...@rxap/plugin-docker@16.0.0-dev.21) (2023-09-03)

**Note:** Version bump only for package @rxap/plugin-docker

# [16.0.0-dev.20](https://gitlab.com/rxap/packages/compare/@rxap/plugin-docker@16.0.0-dev.19...@rxap/plugin-docker@16.0.0-dev.20) (2023-09-03)

**Note:** Version bump only for package @rxap/plugin-docker

# [16.0.0-dev.19](https://gitlab.com/rxap/packages/compare/@rxap/plugin-docker@16.0.0-dev.18...@rxap/plugin-docker@16.0.0-dev.19) (2023-09-03)

### Bug Fixes

- support docker options from nx.json file ([adb9c0e](https://gitlab.com/rxap/packages/commit/adb9c0e9a3cc082e35dffd10b39458ac29c32c44))

# [16.0.0-dev.18](https://gitlab.com/rxap/packages/compare/@rxap/plugin-docker@16.0.0-dev.17...@rxap/plugin-docker@16.0.0-dev.18) (2023-09-02)

### Bug Fixes

- remove quotes around command parameters ([1ca71b9](https://gitlab.com/rxap/packages/commit/1ca71b9ee758b041f19df54d0a5e1eb19e8661cc))

# [16.0.0-dev.17](https://gitlab.com/rxap/packages/compare/@rxap/plugin-docker@16.0.0-dev.16...@rxap/plugin-docker@16.0.0-dev.17) (2023-08-31)

### Bug Fixes

- ensure the project name is not included in the project tag list ([b131ac3](https://gitlab.com/rxap/packages/commit/b131ac3bd92b3b8799d62f15bbd30a1997d7c753))

# [16.0.0-dev.16](https://gitlab.com/rxap/packages/compare/@rxap/plugin-docker@16.0.0-dev.15...@rxap/plugin-docker@16.0.0-dev.16) (2023-08-17)

### Reverts

- change from commonjs to es2022 ([747a381](https://gitlab.com/rxap/packages/commit/747a381a090f0a276cf363da61bb19ed0c9cb5b7))

# [16.0.0-dev.15](https://gitlab.com/rxap/packages/compare/@rxap/plugin-docker@16.0.0-dev.14...@rxap/plugin-docker@16.0.0-dev.15) (2023-08-16)

### Bug Fixes

- change from commonjs to es2022 ([fd0f2ba](https://gitlab.com/rxap/packages/commit/fd0f2bae24eae7c854e96f630076cd5598c30be6))

# [16.0.0-dev.14](https://gitlab.com/rxap/packages/compare/@rxap/plugin-docker@16.0.0-dev.13...@rxap/plugin-docker@16.0.0-dev.14) (2023-08-15)

### Bug Fixes

- copy docker options to gitlab ci configuration ([0f6aee0](https://gitlab.com/rxap/packages/commit/0f6aee04927ece66c554878f1bbf8ea160abbc43))

# [16.0.0-dev.13](https://gitlab.com/rxap/packages/compare/@rxap/plugin-docker@16.0.0-dev.12...@rxap/plugin-docker@16.0.0-dev.13) (2023-08-15)

### Bug Fixes

- ensure docker file has an absolute path ([bf2a233](https://gitlab.com/rxap/packages/commit/bf2a233a1fc4d5e9c07711133c9c43c0065182b9))

# [16.0.0-dev.12](https://gitlab.com/rxap/packages/compare/@rxap/plugin-docker@16.0.0-dev.11...@rxap/plugin-docker@16.0.0-dev.12) (2023-08-15)

### Bug Fixes

- remove slashes from docker tag ([768e3e6](https://gitlab.com/rxap/packages/commit/768e3e65b252369393552f6eedb7575ec6d5fd98))

# [16.0.0-dev.11](https://gitlab.com/rxap/packages/compare/@rxap/plugin-docker@16.0.0-dev.10...@rxap/plugin-docker@16.0.0-dev.11) (2023-08-14)

### Bug Fixes

- use shared Dockerfile for angular projects ([a56a7be](https://gitlab.com/rxap/packages/commit/a56a7be4541068363201ca4f6bdc348ed9208b76))

# [16.0.0-dev.10](https://gitlab.com/rxap/packages/compare/@rxap/plugin-docker@16.0.0-dev.9...@rxap/plugin-docker@16.0.0-dev.10) (2023-08-06)

### Bug Fixes

- expose generators as schematics ([679ca36](https://gitlab.com/rxap/packages/commit/679ca36d3712a11e4dc838762bca2f7c471e1e04))

# [16.0.0-dev.9](https://gitlab.com/rxap/packages/compare/@rxap/plugin-docker@16.0.0-dev.8...@rxap/plugin-docker@16.0.0-dev.9) (2023-08-04)

### Bug Fixes

- add default stage for docker build job ([cbec919](https://gitlab.com/rxap/packages/commit/cbec91945b6c209a04fba970787808e46b5da63d))
- add licence file to publishable packages ([ca6d4d5](https://gitlab.com/rxap/packages/commit/ca6d4d509a743b89bad5ed7ae935d3007231705a))
- add missing echo -e ([8f3733a](https://gitlab.com/rxap/packages/commit/8f3733aeb519ed30078e00d843179ef206bf1458))
- remove unnecessary deployment tier ([53b4790](https://gitlab.com/rxap/packages/commit/53b4790aad58644e40b65d6ef2967fcc73c94462))

# [16.0.0-dev.8](https://gitlab.com/rxap/packages/compare/@rxap/plugin-docker@16.0.0-dev.7...@rxap/plugin-docker@16.0.0-dev.8) (2023-08-04)

### Bug Fixes

- add missing job tags ([3f6790b](https://gitlab.com/rxap/packages/commit/3f6790be7da03e1f73247419e3336bdfb93613d5))
- run gitlab ci generators on application init ([9a15981](https://gitlab.com/rxap/packages/commit/9a15981fd5b573db47259014b2582373867179f2))

### Features

- **gitlab-ci:** add generator ([8ea4982](https://gitlab.com/rxap/packages/commit/8ea498238ad2c6a35d3bf1d76202bc998bfbd86a))

# [16.0.0-dev.7](https://gitlab.com/rxap/packages/compare/@rxap/plugin-docker@16.0.0-dev.6...@rxap/plugin-docker@16.0.0-dev.7) (2023-08-03)

### Bug Fixes

- generate readme with peer dependencies to install ([e7039bb](https://gitlab.com/rxap/packages/commit/e7039bb5e86ffeadfe7cc92d5fc71d32f8efb4fb))
- use current branch name as fallback docker tag ([f1807e6](https://gitlab.com/rxap/packages/commit/f1807e6bca9180b4cc64fffe02f0610d4653d219))

# 16.0.0-dev.6 (2023-08-01)

### Bug Fixes

- restructure and merge mono repos packages, schematics, plugins and nest ([a057d77](https://gitlab.com/rxap/packages/commit/a057d77ca2acf9426a03a497da8532f8a2fe2c86))
- update package dependency versions ([45bd022](https://gitlab.com/rxap/packages/commit/45bd022d755c0c11f7d0bcc76d26b39928007941))

# [16.0.0-dev.5](https://gitlab.com/rxap/packages/compare/@rxap/plugin-docker@16.0.0-dev.4...@rxap/plugin-docker@16.0.0-dev.5) (2023-07-10)

### Bug Fixes

- update package dependency versions ([8479f5c](https://gitlab.com/rxap/packages/commit/8479f5c405a885cc0f300cec6156584e4c65d59c))

# 16.0.0-dev.4 (2023-07-10)

### Bug Fixes

- restructure and merge mono repos packages, schematics, plugins and nest ([653b4cd](https://gitlab.com/rxap/packages/commit/653b4cd39fc92d322df9b3959651fea0aa6079da))

# [16.0.0-dev.3](https://gitlab.com/rxap/schematics/compare/@rxap/plugin-docker@16.0.0-dev.2...@rxap/plugin-docker@16.0.0-dev.3) (2023-05-18)

### Bug Fixes

- remove deprecated pack targetconcept ([39f1869](https://gitlab.com/rxap/schematics/commit/39f18698795cc6f5d8db81b43581c7d75244021f))

# [16.0.0-dev.2](https://gitlab.com/rxap/schematics/compare/@rxap/plugin-docker@16.0.0-dev.1...@rxap/plugin-docker@16.0.0-dev.2) (2023-05-18)

### Bug Fixes

- **deps:** update rxap packages to16.x.x ([bd63f0b](https://gitlab.com/rxap/schematics/commit/bd63f0bfe3356eb1d00bb136253789f2e481e04b))

# [16.0.0-dev.1](https://gitlab.com/rxap/schematics/compare/@rxap/plugin-docker@16.0.0-dev.0...@rxap/plugin-docker@16.0.0-dev.1) (2023-05-17)

**Note:** Version bump only for package @rxap/plugin-docker

# [16.0.0-dev.0](https://gitlab.com/rxap/schematics/compare/@rxap/plugin-docker@15.1.1...@rxap/plugin-docker@16.0.0-dev.0) (2023-05-11)

### Build System

- upgrade to nrwl 16.x.x ([de73759](https://gitlab.com/rxap/schematics/commit/de737599e984ce6e0dd19776ffbd04ab2c4085f3))

### BREAKING CHANGES

- upgrade nrwl 16.x.x

## [15.1.1](https://gitlab.com/rxap/schematics/compare/@rxap/plugin-docker@15.1.0...@rxap/plugin-docker@15.1.1) (2023-05-11)

### Bug Fixes

- update to nrwl 15.9.4 ([c9ab045](https://gitlab.com/rxap/schematics/commit/c9ab0454484162e633b789a6274d77793179df23))

# [15.1.0](https://gitlab.com/rxap/schematics/compare/@rxap/plugin-docker@15.0.0...@rxap/plugin-docker@15.1.0) (2023-01-30)

### Bug Fixes

- **docker:** set default output path prefix todist ([fc9e9db](https://gitlab.com/rxap/schematics/commit/fc9e9db2a330d57aca0ef702dae0ee3d55718505))

### Features

- **docker:** add imageRegistryoption ([a4c3f8e](https://gitlab.com/rxap/schematics/commit/a4c3f8ee1612470cdedc1702c521f8e1cafe9f07))
- **docker:** add savebuilder ([6b8f7df](https://gitlab.com/rxap/schematics/commit/6b8f7dfee83f218a7a7153f5e4d892eaf0744a7b))
- **docker:** update config schematics to new builderoptions ([4a376a8](https://gitlab.com/rxap/schematics/commit/4a376a895d283763d088b11111d1a82d82bc9d8f))

# [15.0.0](https://gitlab.com/rxap/schematics/compare/@rxap/plugin-docker@14.1.2...@rxap/plugin-docker@15.0.0) (2022-12-14)

### chore

- upgrade to nrwl 15.x.x ([b0694b6](https://gitlab.com/rxap/schematics/commit/b0694b6550730b80fb7356f6c225787fda1ff6be))

### BREAKING CHANGES

- upgrade nrwl 15.x.x

## [14.1.2](https://gitlab.com/rxap/schematics/compare/@rxap/plugin-docker@14.1.1...@rxap/plugin-docker@14.1.2) (2022-12-14)

### Bug Fixes

- **docker:** create destinations for each providedtag ([308c9b0](https://gitlab.com/rxap/schematics/commit/308c9b0275e771a701d23e232c9499d293fe0ca5))

## [14.1.1](https://gitlab.com/rxap/schematics/compare/@rxap/plugin-docker@14.1.0...@rxap/plugin-docker@14.1.1) (2022-11-30)

### Bug Fixes

- remove dependency to
  @schematics/angular ([79808ff](https://gitlab.com/rxap/schematics/commit/79808ff002b5e7cb26e163a697a829b2e6c62282))
- remove static build target optiondefinition ([494fb58](https://gitlab.com/rxap/schematics/commit/494fb58e8e283c7a8cd253a91f8e296349dbf6ef))

# [14.1.0](https://gitlab.com/rxap/schematics/compare/@rxap/plugin-docker@14.0.1...@rxap/plugin-docker@14.1.0) (2022-10-11)

### Bug Fixes

- use correct image tag ([0bbe9ba](https://gitlab.com/rxap/schematics/commit/0bbe9bafbbfaf2fd26aabd04a9f28e30091af201))

### Features

- add push option ([8ba1f1b](https://gitlab.com/rxap/schematics/commit/8ba1f1b3c8c1cc1d4ab4bc58fa6369398ca6dc0e))

## [14.0.1](https://gitlab.com/rxap/schematics/compare/@rxap/plugin-docker@14.0.0...@rxap/plugin-docker@14.0.1) (2022-10-06)

### Bug Fixes

- update rxap packages to14.x.x ([eda3337](https://gitlab.com/rxap/schematics/commit/eda3337af2c477126a3d83715cdc7a955c239cb6))

# [14.0.0](https://gitlab.com/rxap/schematics/compare/@rxap/plugin-docker@13.0.1...@rxap/plugin-docker@14.0.0) (2022-09-08)

### chore

- upgrade to 14.x.x ([52cccdb](https://gitlab.com/rxap/schematics/commit/52cccdb066599a3c333117107a06169e5d42c604))

### BREAKING CHANGES

- upgrade to 14.x.x

## [13.0.1](https://gitlab.com/rxap/schematics/compare/@rxap/plugin-docker@13.0.0...@rxap/plugin-docker@13.0.1) (2022-09-08)

**Note:** Version bump only for package @rxap/plugin-docker

# [13.0.0](https://gitlab.com/rxap/schematics/compare/@rxap/plugin-docker@13.0.0-next.3...@rxap/plugin-docker@13.0.0) (2022-09-08)

**Note:** Version bump only for package @rxap/plugin-docker

# [13.0.0-next.3](https://gitlab.com/rxap/schematics/compare/@rxap/plugin-docker@13.0.0-next.2...@rxap/plugin-docker@13.0.0-next.3) (2022-04-24)

### Features

- add imageName buildoption ([75426e8](https://gitlab.com/rxap/schematics/commit/75426e838db8a38045ebc320641b5e0230e0984a))

# [13.0.0-next.2](https://gitlab.com/rxap/schematics/compare/@rxap/plugin-docker@13.0.0-next.1...@rxap/plugin-docker@13.0.0-next.2) (2022-04-24)

### Features

- add imageSuffix buildoption ([9df4d13](https://gitlab.com/rxap/schematics/commit/9df4d13856d42bf097e9439ec2ca316915f594a6))

# 13.0.0-next.1 (2022-04-24)

**Note:** Version bump only for package @rxap/plugin-docker
