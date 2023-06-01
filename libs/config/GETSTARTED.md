Update the angular application `main.ts` to support @rxap/config.

```

// Ensures that the configuration is loaded before the angular application is  started
Promise.all([ConfigService.Load({ 
  // (optional) Defines a list of configuration urls. Defaults to ['config.json']
  url: ['/config/config.json']
})]).then(() =>
  platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .catch((err) => console.error(err))
);

```
