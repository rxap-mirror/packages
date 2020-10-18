# @rxap/config

The package provides the ability to load custom configuration objects from static or dynamic sources.
Additionally the config source can be changed dependent
 on build environment.
 
## Install

```
yarn add @rxap/config
```

```
npm install @rxap/config
```

## Setup

Update the angular application `main.ts` to support @rxap/config.

```

// Defines a list of configuration urls.
ConfigService.Urls = ['/config/config.json'];

// Ensures that the configuration is loaded before the angular application is  started
Promise.all([ConfigService.Load()]).then(() =>
  platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .catch((err) => console.error(err))
);

```
