Update the angular application `main.ts` to support @rxap/config.

```

// (optional) Defines a list of configuration urls.
ConfigService.Urls = ['/config/config.json'];

// Ensures that the configuration is loaded before the angular application is  started
Promise.all([ConfigService.Load()]).then(() =>
  platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .catch((err) => console.error(err))
);

```
