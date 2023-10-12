# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [16.0.0-dev.40](https://gitlab.com/rxap/packages/compare/@rxap/plugin-library@16.0.0-dev.39...@rxap/plugin-library@16.0.0-dev.40) (2023-10-12)

### Bug Fixes

- remove package json update targets from cacheable operations ([6dd372d](https://gitlab.com/rxap/packages/commit/6dd372d0ed9a182d5b99d413a35c1dc29513fc77))

# [16.0.0-dev.39](https://gitlab.com/rxap/packages/compare/@rxap/plugin-library@16.0.0-dev.38...@rxap/plugin-library@16.0.0-dev.39) (2023-10-11)

**Note:** Version bump only for package @rxap/plugin-library

# [16.0.0-dev.38](https://gitlab.com/rxap/packages/compare/@rxap/plugin-library@16.0.0-dev.37...@rxap/plugin-library@16.0.0-dev.38) (2023-10-11)

**Note:** Version bump only for package @rxap/plugin-library

# [16.0.0-dev.37](https://gitlab.com/rxap/packages/compare/@rxap/plugin-library@16.0.0-dev.36...@rxap/plugin-library@16.0.0-dev.37) (2023-10-11)

### Bug Fixes

- ensure overwrite option is respected ([672c315](https://gitlab.com/rxap/packages/commit/672c3152403ae577fb8d4d34e060971d2e53d0af))

# [16.0.0-dev.36](https://gitlab.com/rxap/packages/compare/@rxap/plugin-library@16.0.0-dev.7...@rxap/plugin-library@16.0.0-dev.36) (2023-10-11)

### Bug Fixes

- add expose-as-schematic to plugin projects with generators ([32b28ae](https://gitlab.com/rxap/packages/commit/32b28ae005e3e73d96f0ae77b457b35f1a5721f9))
- add licence file to publishable packages ([d7de1cb](https://gitlab.com/rxap/packages/commit/d7de1cb9db1bd1628f37084e3b0ffd1755aa75f6))
- add missing regex flags ([54fad73](https://gitlab.com/rxap/packages/commit/54fad735b55107c04ba45ae9511bf52c4a309cec))
- add skip-projects flag ([e1f31ed](https://gitlab.com/rxap/packages/commit/e1f31ed837646f605ced82a52749e62af07ba939))
- add the index-export target to all non plugin/schematic/generator project targets ([6d1c533](https://gitlab.com/rxap/packages/commit/6d1c533aee590907e23160d4d54ad04c4c13e4b2))
- array parameters escape ([72925cd](https://gitlab.com/rxap/packages/commit/72925cd4b08344385cab3210221b7b3af43e187d))
- call the schematic utility script if rxap repository ([da3dc46](https://gitlab.com/rxap/packages/commit/da3dc46f3193babb04a90e8c4a5a538f2e9ea6e3))
- change from commonjs to es2022 ([cf675a7](https://gitlab.com/rxap/packages/commit/cf675a7254de9ce4b269264df59794dd42fcbd8b))
- check if homepage is set prevent ref by null ([1b2898e](https://gitlab.com/rxap/packages/commit/1b2898e54b403c9a250129f18e9084bc3f5e6b62))
- check if the LICENSE file exists before access the file ([f14b7e3](https://gitlab.com/rxap/packages/commit/f14b7e3d55e153b5cc2b960a0ee3f5585a96ae9f))
- **check-version:** exclude pre release suffix in comparison ([083f96f](https://gitlab.com/rxap/packages/commit/083f96fe71601da7fcededf378fbaf0fd667e1cc))
- cleanup target version ([6627983](https://gitlab.com/rxap/packages/commit/6627983dbe314fd49484b925515bbb09aa1fd606))
- coerce the index-export default target options ([fc9d188](https://gitlab.com/rxap/packages/commit/fc9d188dd16a910ce2d503b6501bbe3ec186cbf5))
- create publish directory with relative output path ([08884cd](https://gitlab.com/rxap/packages/commit/08884cd41483fc466db7e6f934a233f0ea0c654d))
- enforce that the production configuration is the default configuration ([00ac30e](https://gitlab.com/rxap/packages/commit/00ac30e65dbe1008bff6d4f149631405fc81c200))
- ensure all required cacheable operations are defined ([d9ded9c](https://gitlab.com/rxap/packages/commit/d9ded9c5e150d9781ce490ad7ac292194d09bf2a))
- ensure fix-dependencies for dependencies is run first ([6560021](https://gitlab.com/rxap/packages/commit/6560021bc93d8657e97b363fbee20a0ca64df7b3))
- ensure index-export is run before build target ([5ea6ba8](https://gitlab.com/rxap/packages/commit/5ea6ba85add4ce96af04b3f5da1e8e6e25cdbbb6))
- ensure new line ([5faca82](https://gitlab.com/rxap/packages/commit/5faca824bd3eb43e61ed06ff004bb6b2f15669e0))
- ensure overwrite option is passed to sub schematics ([0c8a19b](https://gitlab.com/rxap/packages/commit/0c8a19b5166f804aa335f739a00a5415bd97f61a))
- ensure the project name is not included in the project tag list ([46d4479](https://gitlab.com/rxap/packages/commit/46d44798258ea1b20df9d4408b9c0809f55027b2))
- exclude .cy.ts files ([b6a0989](https://gitlab.com/rxap/packages/commit/b6a09891e5178c306824bb9671125604625b29f9))
- expose generators as schematics ([8a58d07](https://gitlab.com/rxap/packages/commit/8a58d07c2f1dcfff75e724a418d7c3bddb2d0bbc))
- generate index file for non angular projects ([00ee701](https://gitlab.com/rxap/packages/commit/00ee701811805a38ea6a71284a94b39b02e8a3a4))
- generate readme with peer dependencies to install ([27c2cd7](https://gitlab.com/rxap/packages/commit/27c2cd7d98f0c8a499b8c30719f49d69e4970ae9))
- handle readme generator execution errors ([7c2762d](https://gitlab.com/rxap/packages/commit/7c2762da753edd28210e3e35bef5048964f5beea))
- ignore express and axios packages ([f159354](https://gitlab.com/rxap/packages/commit/f159354d89a2f28d6adefdeab59e2e592c612204))
- ignore projects that have no package.json ([427f3f3](https://gitlab.com/rxap/packages/commit/427f3f3f6933dab1ca211702149f2746f0ac6fe3))
- **init:** use init plugin generator for plugin projects ([e9417c2](https://gitlab.com/rxap/packages/commit/e9417c2b500a08e65f34860d42379c64a16545b9))
- introduce Is\*Project functions ([3c9f251](https://gitlab.com/rxap/packages/commit/3c9f251f1d7be46ca366171e79e86ef2764fa3b0))
- only include file if has export statement ([bf33058](https://gitlab.com/rxap/packages/commit/bf33058e3bcf9ff9479cd3db333d8703157b3bf9))
- peer dependency issue ([ee95415](https://gitlab.com/rxap/packages/commit/ee95415370d9ef2396916d6c25061a0df791034a))
- remove nx dependency ([b2b98b0](https://gitlab.com/rxap/packages/commit/b2b98b01438e9439f9743fb27629c7e96072df45))
- support schema with $ref and allOf properties ([486ed06](https://gitlab.com/rxap/packages/commit/486ed06fb3f9aa33b68a74e024e449e628afd585))
- update default root project name ([71908f4](https://gitlab.com/rxap/packages/commit/71908f43258a3cb1aa0c7cbf1fbf17c5a544a57b))
- use absolute path to access files ([063676e](https://gitlab.com/rxap/packages/commit/063676e3a1f6061c9f3284f79e6ca8091242c0c7))
- use UpdatePackageJson utility function ([1b00ccf](https://gitlab.com/rxap/packages/commit/1b00ccf4608cf5b56b8075497e7a89bdb98fcb59))
- use utility function to set targets and target defaults ([00b5e6a](https://gitlab.com/rxap/packages/commit/00b5e6acd086c72ea99272ed6bb3fd094d7bb654))

### Features

- add init-buildable and init-publishable generator ([90c6f9a](https://gitlab.com/rxap/packages/commit/90c6f9a4d238539ded4e3ed4007793ef835127ab))
- add project to package name mapping utilities ([a0760db](https://gitlab.com/rxap/packages/commit/a0760db47705928ca94803bb6868b9310a6a5b5f))
- **executor:** add check version ([22de28a](https://gitlab.com/rxap/packages/commit/22de28a9802b2d21469723cfdf18ae4e04df718e))
- **generator:** add init-plugin ([c381500](https://gitlab.com/rxap/packages/commit/c38150066b5a63ba70371913d7f729637c19ce80))
- **init:** execute nest init generator if project is for nestjs ([809d428](https://gitlab.com/rxap/packages/commit/809d4280f83bb3127eca044b0e064e5c66ea221b))
- support angular library entrypoints ([f74241d](https://gitlab.com/rxap/packages/commit/f74241de483eaed44241a8e4e2a6268036317851))
- support string interpolation ([3ebbdd9](https://gitlab.com/rxap/packages/commit/3ebbdd98ec87eee7e7fe6af68fd287ad083619cb))

### Reverts

- change from commonjs to es2022 ([50eca61](https://gitlab.com/rxap/packages/commit/50eca61e9a89388d1cfeefb8b1029b302b6f307e))

# [16.0.0-dev.35](https://gitlab.com/rxap/packages/compare/@rxap/plugin-library@16.0.0-dev.34...@rxap/plugin-library@16.0.0-dev.35) (2023-10-09)

### Bug Fixes

- add missing regex flags ([da557ea](https://gitlab.com/rxap/packages/commit/da557eaf8edea23963fb5aa5e9f5b54baddef41c))

# [16.0.0-dev.34](https://gitlab.com/rxap/packages/compare/@rxap/plugin-library@16.0.0-dev.33...@rxap/plugin-library@16.0.0-dev.34) (2023-10-09)

### Bug Fixes

- only include file if has export statement ([acab338](https://gitlab.com/rxap/packages/commit/acab3385744d9bfbf4c6ce1e1423c8ef8f87c46a))

# [16.0.0-dev.33](https://gitlab.com/rxap/packages/compare/@rxap/plugin-library@16.0.0-dev.32...@rxap/plugin-library@16.0.0-dev.33) (2023-10-08)

### Bug Fixes

- ensure index-export is run before build target ([5008aeb](https://gitlab.com/rxap/packages/commit/5008aeb3847cb3ff2b248c83685153abc4a4ffcb))

# [16.0.0-dev.32](https://gitlab.com/rxap/packages/compare/@rxap/plugin-library@16.0.0-dev.31...@rxap/plugin-library@16.0.0-dev.32) (2023-10-03)

### Bug Fixes

- ensure all required cacheable operations are defined ([49a9199](https://gitlab.com/rxap/packages/commit/49a9199cd2592cf8550650dc17f9995e4f6727f8))

# [16.0.0-dev.31](https://gitlab.com/rxap/packages/compare/@rxap/plugin-library@16.0.0-dev.30...@rxap/plugin-library@16.0.0-dev.31) (2023-10-02)

### Bug Fixes

- cleanup target version ([06558eb](https://gitlab.com/rxap/packages/commit/06558eb200e620dfb6ea217885520c6561cd1c25))
- coerce the index-export default target options ([1de131c](https://gitlab.com/rxap/packages/commit/1de131c42dfa133dc448d0d1a300d49e1ae9b7cc))

# [16.0.0-dev.30](https://gitlab.com/rxap/packages/compare/@rxap/plugin-library@16.0.0-dev.29...@rxap/plugin-library@16.0.0-dev.30) (2023-10-02)

### Bug Fixes

- add the index-export target to all non plugin/schematic/generator project targets ([efaac2e](https://gitlab.com/rxap/packages/commit/efaac2e7aca03589c1b80559b51eb08297f6e933))
- check if the LICENSE file exists before access the file ([de5bb8e](https://gitlab.com/rxap/packages/commit/de5bb8ec6ca66c4bfc663152f26b98b77273d30a))
- introduce Is\*Project functions ([0f4a53a](https://gitlab.com/rxap/packages/commit/0f4a53a2a68c7f854d819c005a30957d8b1cb3c6))

# [16.0.0-dev.29](https://gitlab.com/rxap/packages/compare/@rxap/plugin-library@16.0.0-dev.28...@rxap/plugin-library@16.0.0-dev.29) (2023-10-02)

### Bug Fixes

- handle readme generator execution errors ([a5c5204](https://gitlab.com/rxap/packages/commit/a5c5204b6e2bcd39db3d868e1bfa5955b0570dbf))
- support schema with $ref and allOf properties ([c8a1640](https://gitlab.com/rxap/packages/commit/c8a164039443b37e2c0a6b2d1dceb1bfa6312b97))

# [16.0.0-dev.28](https://gitlab.com/rxap/packages/compare/@rxap/plugin-library@16.0.0-dev.27...@rxap/plugin-library@16.0.0-dev.28) (2023-09-21)

### Bug Fixes

- add skip-projects flag ([0f45987](https://gitlab.com/rxap/packages/commit/0f45987bc9dd927b1ede9eb53256125fa0e33674))

# [16.0.0-dev.27](https://gitlab.com/rxap/packages/compare/@rxap/plugin-library@16.0.0-dev.26...@rxap/plugin-library@16.0.0-dev.27) (2023-09-19)

### Bug Fixes

- update default root project name ([85e724a](https://gitlab.com/rxap/packages/commit/85e724a7f08bcffdd4637311fe9560a674672a8f))

# [16.0.0-dev.26](https://gitlab.com/rxap/packages/compare/@rxap/plugin-library@16.0.0-dev.25...@rxap/plugin-library@16.0.0-dev.26) (2023-09-13)

### Bug Fixes

- array parameters escape ([4fd79fe](https://gitlab.com/rxap/packages/commit/4fd79feeafdfece921f6ad9e32269cca882d04f0))

# [16.0.0-dev.25](https://gitlab.com/rxap/packages/compare/@rxap/plugin-library@16.0.0-dev.24...@rxap/plugin-library@16.0.0-dev.25) (2023-09-12)

### Bug Fixes

- peer dependency issue ([e67e2b8](https://gitlab.com/rxap/packages/commit/e67e2b8eb884b598536d16c2c544a9ad9be5b53e))

# [16.0.0-dev.24](https://gitlab.com/rxap/packages/compare/@rxap/plugin-library@16.0.0-dev.23...@rxap/plugin-library@16.0.0-dev.24) (2023-09-12)

### Bug Fixes

- use UpdatePackageJson utility function ([6e0e735](https://gitlab.com/rxap/packages/commit/6e0e735797462edd447bc1c78c804829c6f3c16f))

# [16.0.0-dev.23](https://gitlab.com/rxap/packages/compare/@rxap/plugin-library@16.0.0-dev.22...@rxap/plugin-library@16.0.0-dev.23) (2023-09-07)

**Note:** Version bump only for package @rxap/plugin-library

# [16.0.0-dev.22](https://gitlab.com/rxap/packages/compare/@rxap/plugin-library@16.0.0-dev.21...@rxap/plugin-library@16.0.0-dev.22) (2023-09-03)

**Note:** Version bump only for package @rxap/plugin-library

# [16.0.0-dev.21](https://gitlab.com/rxap/packages/compare/@rxap/plugin-library@16.0.0-dev.20...@rxap/plugin-library@16.0.0-dev.21) (2023-09-03)

### Features

- support string interpolation ([dfcdc79](https://gitlab.com/rxap/packages/commit/dfcdc798f8856dae07b2b7704c60dd145d44a65a))

# [16.0.0-dev.20](https://gitlab.com/rxap/packages/compare/@rxap/plugin-library@16.0.0-dev.19...@rxap/plugin-library@16.0.0-dev.20) (2023-09-02)

### Bug Fixes

- generate index file for non angular projects ([5d88306](https://gitlab.com/rxap/packages/commit/5d8830611d751c3f17eb18a2e5db9aa80e3d2312))

### Features

- support angular library entrypoints ([7718326](https://gitlab.com/rxap/packages/commit/7718326464e1971d6b9463a6ae611a279ba4c1a7))

# [16.0.0-dev.19](https://gitlab.com/rxap/packages/compare/@rxap/plugin-library@16.0.0-dev.18...@rxap/plugin-library@16.0.0-dev.19) (2023-08-31)

### Bug Fixes

- ensure overwrite option is passed to sub schematics ([8472aab](https://gitlab.com/rxap/packages/commit/8472aab8814227c851fab9ae4c1b9ec3019d6f4e))
- ensure the project name is not included in the project tag list ([b131ac3](https://gitlab.com/rxap/packages/commit/b131ac3bd92b3b8799d62f15bbd30a1997d7c753))

# [16.0.0-dev.18](https://gitlab.com/rxap/packages/compare/@rxap/plugin-library@16.0.0-dev.17...@rxap/plugin-library@16.0.0-dev.18) (2023-08-17)

### Reverts

- change from commonjs to es2022 ([747a381](https://gitlab.com/rxap/packages/commit/747a381a090f0a276cf363da61bb19ed0c9cb5b7))

# [16.0.0-dev.17](https://gitlab.com/rxap/packages/compare/@rxap/plugin-library@16.0.0-dev.16...@rxap/plugin-library@16.0.0-dev.17) (2023-08-16)

### Bug Fixes

- change from commonjs to es2022 ([fd0f2ba](https://gitlab.com/rxap/packages/commit/fd0f2bae24eae7c854e96f630076cd5598c30be6))

# [16.0.0-dev.16](https://gitlab.com/rxap/packages/compare/@rxap/plugin-library@16.0.0-dev.15...@rxap/plugin-library@16.0.0-dev.16) (2023-08-14)

### Bug Fixes

- exclude .cy.ts files ([bbaf974](https://gitlab.com/rxap/packages/commit/bbaf97402207b09744fae8b9fb9c5c88f3cf4759))

# [16.0.0-dev.15](https://gitlab.com/rxap/packages/compare/@rxap/plugin-library@16.0.0-dev.14...@rxap/plugin-library@16.0.0-dev.15) (2023-08-06)

### Bug Fixes

- add expose-as-schematic to plugin projects with generators ([6c9fac8](https://gitlab.com/rxap/packages/commit/6c9fac892950e2942e7994673c35987b9b1b6fe7))
- ensure new line ([2db00f1](https://gitlab.com/rxap/packages/commit/2db00f115cf59e0e89fa53c70426b3e7cb829461))
- expose generators as schematics ([679ca36](https://gitlab.com/rxap/packages/commit/679ca36d3712a11e4dc838762bca2f7c471e1e04))

# [16.0.0-dev.14](https://gitlab.com/rxap/packages/compare/@rxap/plugin-library@16.0.0-dev.13...@rxap/plugin-library@16.0.0-dev.14) (2023-08-05)

### Bug Fixes

- check if homepage is set prevent ref by null ([6e86439](https://gitlab.com/rxap/packages/commit/6e8643966ff79d3f329a9a2e73b39a7e27c55849))

# [16.0.0-dev.13](https://gitlab.com/rxap/packages/compare/@rxap/plugin-library@16.0.0-dev.12...@rxap/plugin-library@16.0.0-dev.13) (2023-08-04)

### Bug Fixes

- add licence file to publishable packages ([ca6d4d5](https://gitlab.com/rxap/packages/commit/ca6d4d509a743b89bad5ed7ae935d3007231705a))
- call the schematic utility script if rxap repository ([6497a76](https://gitlab.com/rxap/packages/commit/6497a7680503cf0aab38e5de7db813c0733d191c))
- enforce that the production configuration is the default configuration ([6e9c3b7](https://gitlab.com/rxap/packages/commit/6e9c3b7a58e92bcb5a1b9b772a34153b44acc8f9))

# [16.0.0-dev.12](https://gitlab.com/rxap/packages/compare/@rxap/plugin-library@16.0.0-dev.11...@rxap/plugin-library@16.0.0-dev.12) (2023-08-04)

### Bug Fixes

- remove nx dependency ([5cc2200](https://gitlab.com/rxap/packages/commit/5cc2200ca3f12ef39bb959f98730975978b5194e))

### Features

- add init-buildable and init-publishable generator ([b4ca2ba](https://gitlab.com/rxap/packages/commit/b4ca2ba9ff370be4e9c6d0948f8c62635c8ffac3))

# [16.0.0-dev.11](https://gitlab.com/rxap/packages/compare/@rxap/plugin-library@16.0.0-dev.10...@rxap/plugin-library@16.0.0-dev.11) (2023-08-03)

### Bug Fixes

- ensure fix-dependencies for dependencies is run first ([c01d930](https://gitlab.com/rxap/packages/commit/c01d93095a05877094e701ac385ec7521335a6a4))
- use absolute path to access files ([32323ab](https://gitlab.com/rxap/packages/commit/32323ab900da408dcd6ae05dc12e562feff798f9))
- use utility function to set targets and target defaults ([5914d7e](https://gitlab.com/rxap/packages/commit/5914d7efae28b891044da79f02f077d7b2398d2b))

# [16.0.0-dev.10](https://gitlab.com/rxap/packages/compare/@rxap/plugin-library@16.0.0-dev.9...@rxap/plugin-library@16.0.0-dev.10) (2023-08-03)

### Features

- add project to package name mapping utilities ([86ce9ab](https://gitlab.com/rxap/packages/commit/86ce9abfff3cba758c1f12667002953e5f5f4464))

# [16.0.0-dev.9](https://gitlab.com/rxap/packages/compare/@rxap/plugin-library@16.0.0-dev.8...@rxap/plugin-library@16.0.0-dev.9) (2023-08-01)

### Bug Fixes

- create publish directory with relative output path ([55f5755](https://gitlab.com/rxap/packages/commit/55f575535c58436f8625c148da9d9ec3c25f451d))
- generate readme with peer dependencies to install ([e7039bb](https://gitlab.com/rxap/packages/commit/e7039bb5e86ffeadfe7cc92d5fc71d32f8efb4fb))

# 16.0.0-dev.8 (2023-08-01)

### Bug Fixes

- add glob and fx-extra to package blacklist ([ac94d83](https://gitlab.com/rxap/packages/commit/ac94d83a52efd694fff36afafaadd824df54c525))
- **check-version:** exclude pre release suffix in comparison ([4dce004](https://gitlab.com/rxap/packages/commit/4dce0048bc2985d8d04f4653a41669591dc54b68))
- **fix-dependencies:** reuse existing project dependency version ([288768c](https://gitlab.com/rxap/packages/commit/288768cb2680560313da862b0c2aabc3e8f3207c))
- ignore express and axios packages ([f9234c8](https://gitlab.com/rxap/packages/commit/f9234c88bdec7ffaeb93d5a3a5e1de1d35bbb587))
- ignore projects that have no package.json ([0299bfc](https://gitlab.com/rxap/packages/commit/0299bfc45553853b1c6c9e3e88e4c8ce2b4ac6b4))
- **init:** add the fix-dependencies target and update the preversion script ([05cfb76](https://gitlab.com/rxap/packages/commit/05cfb7626a3329b3c419016525d4ad1d1f1212ef))
- **init:** use init plugin generator for plugin projects ([602f623](https://gitlab.com/rxap/packages/commit/602f62361ac6e10502cfe775d7ec50527e6afec3))
- move GetLatestPackageVersion to @rxap/node-utilities ([72cfdb8](https://gitlab.com/rxap/packages/commit/72cfdb8863b9e6ca567f87d90b8851eca930a2e1))
- remove scss assets copies if \_index.scss does not exist ([22aa410](https://gitlab.com/rxap/packages/commit/22aa41063fa0d24cdcfaee4a85e042390b3d44de))
- restructure and merge mono repos packages, schematics, plugins and nest ([a057d77](https://gitlab.com/rxap/packages/commit/a057d77ca2acf9426a03a497da8532f8a2fe2c86))
- **run-generator:** support dry-run and without-project-argument flags ([19e3fa5](https://gitlab.com/rxap/packages/commit/19e3fa514af26044191a147a77c877e14c701b97))
- update package dependency versions ([45bd022](https://gitlab.com/rxap/packages/commit/45bd022d755c0c11f7d0bcc76d26b39928007941))
- **update-package-group:** only include @rxap/\* packages ([20e6c72](https://gitlab.com/rxap/packages/commit/20e6c72f1f69c0569bfe2655443b4f7533b31c79))
- **update-package-group:** use pined version instead of range ([a18c421](https://gitlab.com/rxap/packages/commit/a18c421093a98b84a3041052a4739df418f970f4))

### Features

- **executor:** add check version ([16b9f21](https://gitlab.com/rxap/packages/commit/16b9f21e4ad29fabe08fea6e095d3f9a469b03b7))
- **generator:** add init-plugin ([fa4d996](https://gitlab.com/rxap/packages/commit/fa4d9967229918b96c8976881705ab7726c1e96c))
- **init:** execute nest init generator if project is for nestjs ([94b2a18](https://gitlab.com/rxap/packages/commit/94b2a1841a0c6c65bed4ececefa2fed033be8c14))

# [16.0.0-dev.7](https://gitlab.com/rxap/packages/compare/@rxap/plugin-library@16.0.0-dev.6...@rxap/plugin-library@16.0.0-dev.7) (2023-07-20)

### Bug Fixes

- add glob and fx-extra to package blacklist ([5f3a7d7](https://gitlab.com/rxap/packages/commit/5f3a7d7e0bcf4cc6ae2fee0210a458f59a103e36))

# [16.0.0-dev.6](https://gitlab.com/rxap/packages/compare/@rxap/plugin-library@16.0.0-dev.5...@rxap/plugin-library@16.0.0-dev.6) (2023-07-13)

### Bug Fixes

- move GetLatestPackageVersion to @rxap/node-utilities ([56bc441](https://gitlab.com/rxap/packages/commit/56bc441d3af89c5c2a99cd3d300e2f4b55dbb624))

# [16.0.0-dev.5](https://gitlab.com/rxap/packages/compare/@rxap/plugin-library@16.0.0-dev.4...@rxap/plugin-library@16.0.0-dev.5) (2023-07-10)

### Bug Fixes

- update package dependency versions ([8479f5c](https://gitlab.com/rxap/packages/commit/8479f5c405a885cc0f300cec6156584e4c65d59c))
- **update-package-group:** only include @rxap/\* packages ([f4631e3](https://gitlab.com/rxap/packages/commit/f4631e3713ed994c5f2cf5b64fd1563e1d6a22a9))

# 16.0.0-dev.4 (2023-07-10)

### Bug Fixes

- **fix-dependencies:** reuse existing project dependency version ([664c64e](https://gitlab.com/rxap/packages/commit/664c64e94d0f5717fa6e78180fbaadb7337f6ffe))
- **init:** add the fix-dependencies target and update the preversion script ([548740b](https://gitlab.com/rxap/packages/commit/548740b8560320afa69566c54ec709171a6ff7b5))
- remove scss assets copies if \_index.scss does not exist ([8d6ef93](https://gitlab.com/rxap/packages/commit/8d6ef93f3ec62cf915743a475ed48258e836f49a))
- restructure and merge mono repos packages, schematics, plugins and nest ([653b4cd](https://gitlab.com/rxap/packages/commit/653b4cd39fc92d322df9b3959651fea0aa6079da))
- **run-generator:** support dry-run and without-project-argument flags ([7f4d918](https://gitlab.com/rxap/packages/commit/7f4d918e4852131550571779ca25b02c904ad83c))
- **update-package-group:** use pined version instead of range ([30b1307](https://gitlab.com/rxap/packages/commit/30b130780dde4fba670429e6dd56377cb94f8513))

# [16.0.0-dev.3](https://gitlab.com/rxap/schematics/compare/@rxap/plugin-library@16.0.0-dev.2...@rxap/plugin-library@16.0.0-dev.3) (2023-05-18)

### Bug Fixes

- remove deprecated pack targetconcept ([39f1869](https://gitlab.com/rxap/schematics/commit/39f18698795cc6f5d8db81b43581c7d75244021f))

# [16.0.0-dev.2](https://gitlab.com/rxap/schematics/compare/@rxap/plugin-library@16.0.0-dev.1...@rxap/plugin-library@16.0.0-dev.2) (2023-05-18)

### Bug Fixes

- **deps:** update rxap packages to16.x.x ([bd63f0b](https://gitlab.com/rxap/schematics/commit/bd63f0bfe3356eb1d00bb136253789f2e481e04b))

# [16.0.0-dev.1](https://gitlab.com/rxap/schematics/compare/@rxap/plugin-library@16.0.0-dev.0...@rxap/plugin-library@16.0.0-dev.1) (2023-05-17)

**Note:** Version bump only for package @rxap/plugin-library

# [16.0.0-dev.0](https://gitlab.com/rxap/schematics/compare/@rxap/plugin-library@15.0.2...@rxap/plugin-library@16.0.0-dev.0) (2023-05-11)

### Build System

- upgrade to nrwl 16.x.x ([de73759](https://gitlab.com/rxap/schematics/commit/de737599e984ce6e0dd19776ffbd04ab2c4085f3))

### BREAKING CHANGES

- upgrade nrwl 16.x.x

## [15.0.2](https://gitlab.com/rxap/schematics/compare/@rxap/plugin-library@15.0.1...@rxap/plugin-library@15.0.2) (2023-05-11)

### Bug Fixes

- update to nrwl 15.9.4 ([c9ab045](https://gitlab.com/rxap/schematics/commit/c9ab0454484162e633b789a6274d77793179df23))

## [15.0.1](https://gitlab.com/rxap/schematics/compare/@rxap/plugin-library@15.0.0...@rxap/plugin-library@15.0.1) (2023-01-30)

**Note:** Version bump only for package @rxap/plugin-library

# [15.0.0](https://gitlab.com/rxap/schematics/compare/@rxap/plugin-library@14.0.3...@rxap/plugin-library@15.0.0) (2022-12-14)

### chore

- upgrade to nrwl 15.x.x ([b0694b6](https://gitlab.com/rxap/schematics/commit/b0694b6550730b80fb7356f6c225787fda1ff6be))

### Features

- **library:** only include direct dependencies ondefault ([8892585](https://gitlab.com/rxap/schematics/commit/889258508b6a157b049ba9ebd74d6c32f8865331))

### BREAKING CHANGES

- upgrade nrwl 15.x.x

## [14.0.3](https://gitlab.com/rxap/schematics/compare/@rxap/plugin-library@14.0.2...@rxap/plugin-library@14.0.3) (2022-12-14)

**Note:** Version bump only for package @rxap/plugin-library

## [14.0.2](https://gitlab.com/rxap/schematics/compare/@rxap/plugin-library@14.0.1...@rxap/plugin-library@14.0.2) (2022-10-06)

### Bug Fixes

- update rxap packages to14.x.x ([eda3337](https://gitlab.com/rxap/schematics/commit/eda3337af2c477126a3d83715cdc7a955c239cb6))

## [14.0.1](https://gitlab.com/rxap/schematics/compare/@rxap/plugin-library@14.0.0...@rxap/plugin-library@14.0.1) (2022-10-06)

### Bug Fixes

- remove @rxap/utilitiesdependency ([fa8b3e6](https://gitlab.com/rxap/schematics/commit/fa8b3e667f7c4e5e1a5f15a5d0cc9543da72729d))

# [14.0.0](https://gitlab.com/rxap/schematics/compare/@rxap/plugin-library@13.0.1...@rxap/plugin-library@14.0.0) (2022-09-08)

### chore

- upgrade to 14.x.x ([52cccdb](https://gitlab.com/rxap/schematics/commit/52cccdb066599a3c333117107a06169e5d42c604))

### BREAKING CHANGES

- upgrade to 14.x.x

## [13.0.1](https://gitlab.com/rxap/schematics/compare/@rxap/plugin-library@13.0.0...@rxap/plugin-library@13.0.1) (2022-09-08)

**Note:** Version bump only for package @rxap/plugin-library

# [13.0.0](https://gitlab.com/rxap/schematics/compare/@rxap/plugin-library@13.0.0-next.2...@rxap/plugin-library@13.0.0) (2022-09-08)

**Note:** Version bump only for package @rxap/plugin-library

# [13.0.0-next.2](https://gitlab.com/rxap/schematics/compare/@rxap/plugin-library@12.4.2...@rxap/plugin-library@13.0.0-next.2) (2022-03-24)

### Bug Fixes

- update catch type ([a3a376b](https://gitlab.com/rxap/schematics/commit/a3a376be772f10889a1f7e1afdf18895ce070d9e))
- **update-peer-dependencies:** migrate to use the createProjectGraphAsync if cache isunavailable ([3454d1d](https://gitlab.com/rxap/schematics/commit/3454d1d0f21a201da01169e4bd470811bcbac919))
- **update-peer-dependencies:** update to the new project graphstructure ([1b86986](https://gitlab.com/rxap/schematics/commit/1b86986ab259eaa6859f827164c389fd17fa63fc))

### Build System

- upgrade to nrwl 13.x.x ([8f07b6b](https://gitlab.com/rxap/schematics/commit/8f07b6b82fb82e8b70fbc82bd91a08d69cc52692))

### BREAKING CHANGES

- update the core nrwl packages to 13.x.x

Signed-off-by: Merzough Münker <mmuenker@digitaix.com>

# [13.0.0-next.1](https://gitlab.com/rxap/schematics/compare/@rxap/plugin-library@13.0.0-next.0...@rxap/plugin-library@13.0.0-next.1) (2022-02-25)

### Bug Fixes

- update catch type ([4587831](https://gitlab.com/rxap/schematics/commit/45878319c926061dc8995c568278c4ae7a903feb))

# [13.0.0-next.0](https://gitlab.com/rxap/schematics/compare/@rxap/plugin-library@12.4.2...@rxap/plugin-library@13.0.0-next.0) (2022-02-19)

### Bug Fixes

- **update-peer-dependencies:** migrate to use the createProjectGraphAsync if cache isunavailable ([5307344](https://gitlab.com/rxap/schematics/commit/530734419cd4c05a1c13443da0e0cad0ce510d79))
- **update-peer-dependencies:** update to the new project graphstructure ([3cc7378](https://gitlab.com/rxap/schematics/commit/3cc7378eef2372b1caf4c4587a70d6e23e0aadcf))

### Build System

- upgrade to nrwl 13.x.x ([f6fb1fd](https://gitlab.com/rxap/schematics/commit/f6fb1fde34006136be4dadd72795d2d43207072a))

### BREAKING CHANGES

- update the core nrwl packages to 13.x.x

Signed-off-by: Merzough Münker <mmuenker@digitaix.com>

## [12.4.2](https://gitlab.com/rxap/schematics/compare/@rxap/plugin-library@12.4.2-next.1...@rxap/plugin-library@12.4.2) (2021-10-07)

**Note:** Version bump only for package @rxap/plugin-library

## [12.4.2-next.1](https://gitlab.com/rxap/schematics/compare/@rxap/plugin-library@12.4.2-next.0...@rxap/plugin-library@12.4.2-next.1) (2021-08-11)

### Bug Fixes

- add nrwl package to peerdependencies ([e15f848](https://gitlab.com/rxap/schematics/commit/e15f848369366bad60b63b32c7e71710b1ded826))

## [12.4.2-next.0](https://gitlab.com/rxap/schematics/compare/@rxap/plugin-library@12.4.1...@rxap/plugin-library@12.4.2-next.0) (2021-08-10)

### Bug Fixes

- add strict tsc compileroption ([a262758](https://gitlab.com/rxap/schematics/commit/a2627582222671e58f6feaed0309d33ab13e6984))

## [12.4.1](https://gitlab.com/rxap/schematics/compare/@rxap/plugin-library@12.4.0...@rxap/plugin-library@12.4.1) (2021-07-27)

### Bug Fixes

- replace deprecated schema idproperty ([cb8dedb](https://gitlab.com/rxap/schematics/commit/cb8dedb0c15c774f6c101df150f0d98242bc511a))

# [12.4.0](https://gitlab.com/rxap/schematics/compare/@rxap/plugin-library@12.4.0-next.1...@rxap/plugin-library@12.4.0) (2021-07-09)

**Note:** Version bump only for package @rxap/plugin-library

# [12.4.0-next.1](https://gitlab.com/rxap/schematics/compare/@rxap/plugin-library@12.4.0-next.0...@rxap/plugin-library@12.4.0-next.1) (2021-07-08)

### Bug Fixes

- include hidden files in schematics filesfolder ([028450e](https://gitlab.com/rxap/schematics/commit/028450e11e0f0caeec7ace91e84d45a606ff2dad))

# [12.4.0-next.0](https://gitlab.com/rxap/schematics/compare/@rxap/plugin-library@12.3.2...@rxap/plugin-library@12.4.0-next.0) (2021-06-28)

### Bug Fixes

- **update-package-dependencies:** only update ng-package ifexists ([0374698](https://gitlab.com/rxap/schematics/commit/0374698b552356409336b4389e09b16b44746f57))

### Features

- **update-package-dependencies:** add optiondependencies ([c7c7fd8](https://gitlab.com/rxap/schematics/commit/c7c7fd83d3f143508009d3af34ed1daac37d90a2))

## [12.3.2](https://gitlab.com/rxap/schematics/compare/@rxap/plugin-library@12.3.1...@rxap/plugin-library@12.3.2) (2021-06-23)

**Note:** Version bump only for package @rxap/plugin-library

## [12.3.1](https://gitlab.com/rxap/schematics/compare/@rxap/plugin-library@12.3.0...@rxap/plugin-library@12.3.1) (2021-06-23)

### Bug Fixes

- mv typescript package todependencies ([06a7d2b](https://gitlab.com/rxap/schematics/commit/06a7d2bbbf5b0018cacdeb2445942719682c6937))

# [12.3.0](https://gitlab.com/rxap/schematics/compare/@rxap/plugin-library@12.2.0...@rxap/plugin-library@12.3.0) (2021-06-23)

### Features

- remove lernadependency ([652fed9](https://gitlab.com/rxap/schematics/commit/652fed9b577a2554e0212320ed78281ef204eb10))

# [12.2.0](https://gitlab.com/rxap/schematics/compare/@rxap/plugin-library@12.1.2...@rxap/plugin-library@12.2.0) (2021-06-23)

### Bug Fixes

- mv peerDependencies todependencies ([97be8bf](https://gitlab.com/rxap/schematics/commit/97be8bf8395ede8e5a50804b9ad7f72fde12bc81))

### Features

- **update-package-dependencies:** update the package.jsondependencies ([6afdf0e](https://gitlab.com/rxap/schematics/commit/6afdf0ed0881b6ff85e720ff1ca0d6cd3f4dbfdd))

## [12.1.2](https://gitlab.com/rxap/schematics/compare/@rxap/plugin-library@12.1.1...@rxap/plugin-library@12.1.2) (2021-06-23)

### Bug Fixes

- only write json file ifchanged ([b39207b](https://gitlab.com/rxap/schematics/commit/b39207b446fde7ea294a3eb1313ed714f6861ece))

## [12.1.1](https://gitlab.com/rxap/schematics/compare/@rxap/plugin-library@12.1.0...@rxap/plugin-library@12.1.1) (2021-06-23)

### Bug Fixes

- set ng-add save target todevDependencies ([c213f21](https://gitlab.com/rxap/schematics/commit/c213f21067e8bb280a48ae726840bfe0f5c4ff11))

# [12.1.0](https://gitlab.com/rxap/schematics/compare/@rxap/plugin-library@12.0.1...@rxap/plugin-library@12.1.0) (2021-06-23)

### Bug Fixes

- ensure the peerDependencies property isdefined ([90122eb](https://gitlab.com/rxap/schematics/commit/90122eb42382c2761f8124a88d79f3a16e8c5635))
- use correct optionsproperty ([2fea2f8](https://gitlab.com/rxap/schematics/commit/2fea2f801c9d3fe4ecceac0a568cfe93cfa42971))

### Features

- add update-package-groupbuilder ([e04006b](https://gitlab.com/rxap/schematics/commit/e04006bf53b3988fd110f8e61c899503e0e98c3d))
- add update-peer-dependencybuilder ([f473dbe](https://gitlab.com/rxap/schematics/commit/f473dbeef0b1fcd5d5bba52ebff8311a6578e7a7))

## 12.0.1 (2021-06-21)

**Note:** Version bump only for package @rxap/plugin-library
