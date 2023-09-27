# Workspace

## Projects Tags

| name              | description                                                                         |
|-------------------|-------------------------------------------------------------------------------------|
| scope:core        | indicate that the project provides core functionality                               |
| scope:utilities   | indicate that the project contains utilities for other projects                     |
| scope:integration | indicate that the project supports the integration of external packages or services |
| scope:compose | indicate that the project compose the ability of multi projects |
| standalone        | indicate that the project can be used independently from other projects             |

### Dependency restrictions

1. A project with the tag `scope:core` can only depend on other projects with the tag `scope:utilities`
2. A project with the tag `scope:utilities` can only depend on other projects with the tag `scope:utilities`
3. A project with the tag `scope:integration` can only depend on other projects with the tag `scope:core` or `scope:utilities`
3. A project with the tag `scope:compose` can only depend on other projects with the tag `scope:core`, `scope:utilities`, `scope:compose` or `scope:integration`
4. A project with the tag `standalone` can only depend on other projects with the tag `scope:utilities`
