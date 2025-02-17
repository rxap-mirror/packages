## Create a new n8n package

**Create the publishable js library**
```sh
nx g @nx/js:library \
    --directory=packages/n8n/nodes/cqrs \
    --importPath=@rxap/n8n-nodes-cqrs \
    --linter=eslint \
    --name=n8n-nodes-cqrs \
    --useProjectJson=true
```

**Init the n8n library**
```sh
nx g @rxap/plugin-n8n:init --project n8n-nodes-cqrs
```

**Add a new node to the library**
```sh
nx g @rxap/plugin-n8n:node \
    --name sanitizeHtml \
    --description "" \
    --project n8n-nodes-sanitize-html \
    --nodeNamePrefix ""
```
