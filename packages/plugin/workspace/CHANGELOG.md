# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [16.1.0-dev.34](https://gitlab.com/rxap/packages/compare/@rxap/plugin-workspace@16.1.0-dev.33...@rxap/plugin-workspace@16.1.0-dev.34) (2023-10-02)

### Bug Fixes

- in application workspace the tailwind is disabled for libraries per default ([2bd87fc](https://gitlab.com/rxap/packages/commit/2bd87fc2d697cbf75cf6e7d7f35b50043f2a9737))
- introduce more Is\*Project functions ([8d37211](https://gitlab.com/rxap/packages/commit/8d37211fb1906f90d7176cfcfe43f755f04a0fa6))

# [16.1.0-dev.33](https://gitlab.com/rxap/packages/compare/@rxap/plugin-workspace@16.1.0-dev.32...@rxap/plugin-workspace@16.1.0-dev.33) (2023-10-02)

### Bug Fixes

- ensure the environment name is set to development for each service ([716c311](https://gitlab.com/rxap/packages/commit/716c31102c2b7468c78e04178a56a97ba239335e))

# [16.1.0-dev.32](https://gitlab.com/rxap/packages/compare/@rxap/plugin-workspace@16.1.0-dev.31...@rxap/plugin-workspace@16.1.0-dev.32) (2023-09-27)

### Bug Fixes

- mount custom service settings from detected folder ([ec8e511](https://gitlab.com/rxap/packages/commit/ec8e511da580abf02686a89be660c7624fbae13e))
- remove application specific generator steps ([2a026e0](https://gitlab.com/rxap/packages/commit/2a026e0755d3736caa3daffb83b49368de5b3b6b))
- use CoerceFilesStructure function ([4bc088e](https://gitlab.com/rxap/packages/commit/4bc088eefdc1d2cf8444c395c7d8e648330b7f6f))

### Features

- add docker compose generator files ([b2994bf](https://gitlab.com/rxap/packages/commit/b2994bf52dae8395f114a7a1fd45c8dc6e912fc3))
- coerce the lerna.json file ([6554b3c](https://gitlab.com/rxap/packages/commit/6554b3c223241c7155ee45063a60e787c0037c32))

# [16.1.0-dev.31](https://gitlab.com/rxap/packages/compare/@rxap/plugin-workspace@16.1.0-dev.30...@rxap/plugin-workspace@16.1.0-dev.31) (2023-09-21)

### Bug Fixes

- add skip-projects flag ([0f45987](https://gitlab.com/rxap/packages/commit/0f45987bc9dd927b1ede9eb53256125fa0e33674))

# [16.1.0-dev.30](https://gitlab.com/rxap/packages/compare/@rxap/plugin-workspace@16.1.0-dev.29...@rxap/plugin-workspace@16.1.0-dev.30) (2023-09-21)

### Bug Fixes

- support any docker compose file name ([cd44128](https://gitlab.com/rxap/packages/commit/cd44128797bbc42105d673934b398b37d5bd809b))

# [16.1.0-dev.29](https://gitlab.com/rxap/packages/compare/@rxap/plugin-workspace@16.1.0-dev.28...@rxap/plugin-workspace@16.1.0-dev.29) (2023-09-20)

### Bug Fixes

- stop all container from all docker compose files ([fb377fd](https://gitlab.com/rxap/packages/commit/fb377fd249515070f73912780ac119ac37ea83a6))

# [16.1.0-dev.28](https://gitlab.com/rxap/packages/compare/@rxap/plugin-workspace@16.1.0-dev.27...@rxap/plugin-workspace@16.1.0-dev.28) (2023-09-20)

### Bug Fixes

- remove minio container name ([9eaf12a](https://gitlab.com/rxap/packages/commit/9eaf12a607bc3b72f3ab34c06660687d141b4809))

# [16.1.0-dev.27](https://gitlab.com/rxap/packages/compare/@rxap/plugin-workspace@16.1.0-dev.26...@rxap/plugin-workspace@16.1.0-dev.27) (2023-09-19)

### Bug Fixes

- use updated path for health checks ([dbc737f](https://gitlab.com/rxap/packages/commit/dbc737f121eba9857a99c8066264750ee18cf143))

# [16.1.0-dev.26](https://gitlab.com/rxap/packages/compare/@rxap/plugin-workspace@16.1.0-dev.25...@rxap/plugin-workspace@16.1.0-dev.26) (2023-09-19)

### Bug Fixes

- add yarn rc file ([59f5588](https://gitlab.com/rxap/packages/commit/59f5588c8b5d59b64d1fd2db695ef8260eaff45e))
- remove explicit domain ([b287242](https://gitlab.com/rxap/packages/commit/b287242cf4b8ab73895c40e989eb9d8e3a292d9c))
- support local service execution ([67fb93f](https://gitlab.com/rxap/packages/commit/67fb93f79ec98ea03ad2d2624384649517c0bce3))
- update authentik service init ([4049928](https://gitlab.com/rxap/packages/commit/4049928a2b076f94503f97d0c21370710925c3b7))
- use correct project name ([0dd02ec](https://gitlab.com/rxap/packages/commit/0dd02ec8f6c4874b700a48746904f206694c5dcf))

# [16.1.0-dev.25](https://gitlab.com/rxap/packages/compare/@rxap/plugin-workspace@16.1.0-dev.24...@rxap/plugin-workspace@16.1.0-dev.25) (2023-09-18)

### Bug Fixes

- set explicit root domain ([f1566a7](https://gitlab.com/rxap/packages/commit/f1566a79d2bc21dc2bbb3a58f2a4df9367b7612b))
- split local and remote pull ([76bec5a](https://gitlab.com/rxap/packages/commit/76bec5abb3ece8b9fbd500eee20bb371c6d0b690))

# [16.1.0-dev.24](https://gitlab.com/rxap/packages/compare/@rxap/plugin-workspace@16.1.0-dev.23...@rxap/plugin-workspace@16.1.0-dev.24) (2023-09-18)

### Bug Fixes

- set default nest and angular directory ([c24219c](https://gitlab.com/rxap/packages/commit/c24219c7e143decb81c1cec8805970bdfee815c0))

# [16.1.0-dev.23](https://gitlab.com/rxap/packages/compare/@rxap/plugin-workspace@16.1.0-dev.22...@rxap/plugin-workspace@16.1.0-dev.23) (2023-09-18)

### Bug Fixes

- use registry.gitlab.com as default registry ([49015c8](https://gitlab.com/rxap/packages/commit/49015c8d45779992ae9ee861073e6bb500c0ed4a))

# [16.1.0-dev.22](https://gitlab.com/rxap/packages/compare/@rxap/plugin-workspace@16.1.0-dev.21...@rxap/plugin-workspace@16.1.0-dev.22) (2023-09-18)

### Bug Fixes

- init nx json configurations ([9b4b023](https://gitlab.com/rxap/packages/commit/9b4b023e849d1c0bf21b14a9e219a0e9cd6ab2f6))

# [16.1.0-dev.21](https://gitlab.com/rxap/packages/compare/@rxap/plugin-workspace@16.1.0-dev.20...@rxap/plugin-workspace@16.1.0-dev.21) (2023-09-18)

### Bug Fixes

- include missing domains ([ae2c306](https://gitlab.com/rxap/packages/commit/ae2c306212777735f3a5570218abef651088ec20))
- update initial workspace files ([5b732f3](https://gitlab.com/rxap/packages/commit/5b732f355267ce5ef77f8f474595a09e58b4ae82))
- update service configuration name ([2686a78](https://gitlab.com/rxap/packages/commit/2686a7821685c0206eb7d390bfa1943c44795662))
- update service status name ([238353c](https://gitlab.com/rxap/packages/commit/238353c821f25268af93599756406e73431fca21))

# [16.1.0-dev.20](https://gitlab.com/rxap/packages/compare/@rxap/plugin-workspace@16.1.0-dev.19...@rxap/plugin-workspace@16.1.0-dev.20) (2023-09-18)

### Bug Fixes

- generate traefik default certs ([c3b23ff](https://gitlab.com/rxap/packages/commit/c3b23ff1c050b34462111490aec9d4b5f6636640))

# [16.1.0-dev.19](https://gitlab.com/rxap/packages/compare/@rxap/plugin-workspace@16.1.0-dev.18...@rxap/plugin-workspace@16.1.0-dev.19) (2023-09-18)

### Bug Fixes

- add missing project config update ([ea08942](https://gitlab.com/rxap/packages/commit/ea08942b273c0957bb7f75bd8f2bed769ae4b07a))

# [16.1.0-dev.18](https://gitlab.com/rxap/packages/compare/@rxap/plugin-workspace@16.1.0-dev.17...@rxap/plugin-workspace@16.1.0-dev.18) (2023-09-18)

### Bug Fixes

- update initial workspace files ([7978009](https://gitlab.com/rxap/packages/commit/7978009bdf2185d5776efe780c162a13c8ecd72c))

### Features

- generate project traefik file ([3ccb370](https://gitlab.com/rxap/packages/commit/3ccb37099cb3416bc39bac4511e35366a368eea6))

# [16.1.0-dev.17](https://gitlab.com/rxap/packages/compare/@rxap/plugin-workspace@16.1.0-dev.16...@rxap/plugin-workspace@16.1.0-dev.17) (2023-09-18)

### Bug Fixes

- add missing initial workspace files ([a2938ca](https://gitlab.com/rxap/packages/commit/a2938ca405718d0dee72d4c9dbc6437fb9621289))
- coerce workspace project ([5510394](https://gitlab.com/rxap/packages/commit/5510394d5b4e09df28083bfabc8852063264c640))

# [16.1.0-dev.16](https://gitlab.com/rxap/packages/compare/@rxap/plugin-workspace@16.1.0-dev.15...@rxap/plugin-workspace@16.1.0-dev.16) (2023-09-17)

### Bug Fixes

- split GuessOutputPath function ([5fc44e1](https://gitlab.com/rxap/packages/commit/5fc44e1470ca16b542e0b45049bfd9a83b8baab8))

# [16.1.0-dev.15](https://gitlab.com/rxap/packages/compare/@rxap/plugin-workspace@16.1.0-dev.14...@rxap/plugin-workspace@16.1.0-dev.15) (2023-09-13)

### Bug Fixes

- remove error message ([16600e9](https://gitlab.com/rxap/packages/commit/16600e957d76e0ee9b799dd835adc08e7ee7193b))

# [16.1.0-dev.14](https://gitlab.com/rxap/packages/compare/@rxap/plugin-workspace@16.1.0-dev.13...@rxap/plugin-workspace@16.1.0-dev.14) (2023-09-13)

### Bug Fixes

- remove m2v dependency ([73f0203](https://gitlab.com/rxap/packages/commit/73f0203a21aeaa3a0405f8ce3baa6b1b2a1a755f))

# [16.1.0-dev.13](https://gitlab.com/rxap/packages/compare/@rxap/plugin-workspace@16.1.0-dev.12...@rxap/plugin-workspace@16.1.0-dev.13) (2023-09-12)

### Bug Fixes

- peer dependency issue ([e67e2b8](https://gitlab.com/rxap/packages/commit/e67e2b8eb884b598536d16c2c544a9ad9be5b53e))

# [16.1.0-dev.12](https://gitlab.com/rxap/packages/compare/@rxap/plugin-workspace@16.1.0-dev.11...@rxap/plugin-workspace@16.1.0-dev.12) (2023-09-12)

### Bug Fixes

- refactor the build.json concept ([7193cef](https://gitlab.com/rxap/packages/commit/7193cef9ffe76efdfedcd6e6d82e947c1be9c15b))

### Features

- add ci info executor ([b6f6496](https://gitlab.com/rxap/packages/commit/b6f6496e1399b63656ecc794f31728e20f853f20))

# [16.1.0-dev.11](https://gitlab.com/rxap/packages/compare/@rxap/plugin-workspace@16.1.0-dev.10...@rxap/plugin-workspace@16.1.0-dev.11) (2023-09-07)

**Note:** Version bump only for package @rxap/plugin-workspace

# [16.1.0-dev.10](https://gitlab.com/rxap/packages/compare/@rxap/plugin-workspace@16.1.0-dev.9...@rxap/plugin-workspace@16.1.0-dev.10) (2023-09-03)

**Note:** Version bump only for package @rxap/plugin-workspace

# [16.1.0-dev.9](https://gitlab.com/rxap/packages/compare/@rxap/plugin-workspace@16.1.0-dev.8...@rxap/plugin-workspace@16.1.0-dev.9) (2023-09-03)

### Features

- add project-target generator ([737dd40](https://gitlab.com/rxap/packages/commit/737dd405eac736449dbce395c32425812e3b9d39))

# [16.1.0-dev.8](https://gitlab.com/rxap/packages/compare/@rxap/plugin-workspace@16.1.0-dev.7...@rxap/plugin-workspace@16.1.0-dev.8) (2023-09-03)

### Bug Fixes

- support docker options from nx.json file ([adb9c0e](https://gitlab.com/rxap/packages/commit/adb9c0e9a3cc082e35dffd10b39458ac29c32c44))

# [16.1.0-dev.7](https://gitlab.com/rxap/packages/compare/@rxap/plugin-workspace@16.1.0-dev.6...@rxap/plugin-workspace@16.1.0-dev.7) (2023-09-01)

### Bug Fixes

- remove redundant traefik labels ([02d572d](https://gitlab.com/rxap/packages/commit/02d572d73eb5c9a9db8ba50b5a7fe7e04429e369))

# [16.1.0-dev.6](https://gitlab.com/rxap/packages/compare/@rxap/plugin-workspace@16.1.0-dev.5...@rxap/plugin-workspace@16.1.0-dev.6) (2023-08-31)

### Bug Fixes

- ensure overwrite option is passed to sub schematics ([8472aab](https://gitlab.com/rxap/packages/commit/8472aab8814227c851fab9ae4c1b9ec3019d6f4e))
- ensure the project name is not included in the project tag list ([b131ac3](https://gitlab.com/rxap/packages/commit/b131ac3bd92b3b8799d62f15bbd30a1997d7c753))
- support new nest application structure ([1131c06](https://gitlab.com/rxap/packages/commit/1131c068e5967708283d0d9c79b81ea63af7d51c))

# [16.1.0-dev.5](https://gitlab.com/rxap/packages/compare/@rxap/plugin-workspace@16.1.0-dev.4...@rxap/plugin-workspace@16.1.0-dev.5) (2023-08-17)

### Reverts

- change from commonjs to es2022 ([747a381](https://gitlab.com/rxap/packages/commit/747a381a090f0a276cf363da61bb19ed0c9cb5b7))

# [16.1.0-dev.4](https://gitlab.com/rxap/packages/compare/@rxap/plugin-workspace@16.1.0-dev.3...@rxap/plugin-workspace@16.1.0-dev.4) (2023-08-16)

### Bug Fixes

- change from commonjs to es2022 ([fd0f2ba](https://gitlab.com/rxap/packages/commit/fd0f2bae24eae7c854e96f630076cd5598c30be6))

# [16.1.0-dev.3](https://gitlab.com/rxap/packages/compare/@rxap/plugin-workspace@16.1.0-dev.2...@rxap/plugin-workspace@16.1.0-dev.3) (2023-08-06)

### Bug Fixes

- expose generators as schematics ([679ca36](https://gitlab.com/rxap/packages/commit/679ca36d3712a11e4dc838762bca2f7c471e1e04))

# [16.1.0-dev.2](https://gitlab.com/rxap/packages/compare/@rxap/plugin-workspace@16.1.0-dev.1...@rxap/plugin-workspace@16.1.0-dev.2) (2023-08-04)

### Bug Fixes

- add licence file to publishable packages ([ca6d4d5](https://gitlab.com/rxap/packages/commit/ca6d4d509a743b89bad5ed7ae935d3007231705a))
- install yarn 3 in the before script ([b1378f8](https://gitlab.com/rxap/packages/commit/b1378f80b10760024da2167600c09fb9acc56cd5))
- remove redundant command parameters ([80d360f](https://gitlab.com/rxap/packages/commit/80d360ff3060d50f3636b9796d59a1f726630adf))
- remove unnecessary deployment tier ([53b4790](https://gitlab.com/rxap/packages/commit/53b4790aad58644e40b65d6ef2967fcc73c94462))

# [16.1.0-dev.1](https://gitlab.com/rxap/packages/compare/@rxap/plugin-workspace@16.1.0-dev.0...@rxap/plugin-workspace@16.1.0-dev.1) (2023-08-04)

### Bug Fixes

- move nx parallel parameter to run all utility ([38334ca](https://gitlab.com/rxap/packages/commit/38334ca40ef7c54674905adc035fe8bde2128248))
- relative path issue and spelling ([29fa19c](https://gitlab.com/rxap/packages/commit/29fa19cb47f21264aa94f989a08182ab9f8f2f9a))

### Features

- **init:** add generator ([cc49b7d](https://gitlab.com/rxap/packages/commit/cc49b7d4732092e83335c9809e3458cf29c731be))
- **init:** create workspace specific files ([8fd0dce](https://gitlab.com/rxap/packages/commit/8fd0dce224dc6c834bee48301ed86ce064158bf2))

# 16.1.0-dev.0 (2023-08-03)

### Features

- add docker-compose executor ([d3f6bba](https://gitlab.com/rxap/packages/commit/d3f6bbaa05d8ff9565fd131cdf8d45b64cee108c))
