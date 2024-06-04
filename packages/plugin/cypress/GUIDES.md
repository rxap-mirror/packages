First, add the init generator to the workspace schematic configuration and create all required files

```bash
nx g @rxap/plugin-cypress:init
```

## Library

Use the cypress component configuration generator to add the required files and configurations to an angular library

```bash
nx g @nx/angular:cypress-component-configuration --buildTarget cypress:build --project $projectName
```

Use the init library generator to setup all required configurations

```bash
nx g @rxap/plugin-cypress:init-library --project $projectName
```

## Application
