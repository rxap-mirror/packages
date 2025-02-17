This package provides a NestJS module for integrating with Supabase. It offers a configurable module with options for setting the Supabase URL and key, and a service for interacting with the Supabase client. The module also includes an options loader for retrieving configuration from NestJS ConfigService.

[![npm version](https://img.shields.io/npm/v/@rxap/nest-supabase?style=flat-square)](https://www.npmjs.com/package/@rxap/nest-supabase)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/nest-supabase)
![npm](https://img.shields.io/npm/dm/@rxap/nest-supabase)
![NPM](https://img.shields.io/npm/l/@rxap/nest-supabase)

- [Installation](#installation)
- [Generators](#generators)
  - [init](#init)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/nest-supabase
```
**Install peer dependencies:**
```bash
yarn add @nestjs/common@^10.3.8 @nestjs/config@^3.2.2 @supabase/supabase-js@^2.38.0 
```
**Execute the init generator:**
```bash
yarn nx g @rxap/nest-supabase:init
```
# Generators

## init
> Initialize the package in the workspace

```bash
nx g @rxap/nest-supabase:init
```
