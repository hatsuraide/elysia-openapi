# @hatsura/elysia-openapi

Fork of [`@elysiajs/openapi`](https://github.com/elysiajs/elysia-openapi) **1.4.16**, maintained by [@hatsuraide](https://github.com/hatsuraide). Versioning is independent from upstream.

Plugin for [elysia](https://github.com/elysiajs/elysia) to auto-generate API documentation page.

## Installation
```bash
bun add @hatsura/elysia-openapi
```

## Example
```typescript
import { Elysia, t } from 'elysia'
import { openapi } from '@hatsura/elysia-openapi'

const app = new Elysia()
    .use(openapi())
    .get('/', () => 'hi', { response: t.String({ description: 'sample description' }) })
    .post(
        '/json/:id',
        ({ body, params: { id }, query: { name } }) => ({
            ...body,
            id,
            name
        }),
        {
            params: t.Object({
                id: t.String()
            }),
            query: t.Object({
                name: t.String()
            }),
            body: t.Object({
                username: t.String(),
                password: t.String()
            }),
            response: t.Object({
                username: t.String(),
                password: t.String(),
                id: t.String(),
                name: t.String()
            }, { description: 'sample description' })
        }
    )
    .listen(8080);
```

Then go to `http://localhost:8080/openapi`.

## Multiple documents

Serve multiple OpenAPI documents from a single documentation UI:

```typescript
import { Elysia } from 'elysia'
import { openapi } from '@hatsura/elysia-openapi'

const app = new Elysia()
    .use(
        openapi({
            path: '/docs',
            documentations: [
                {
                    name: 'Public API',
                    specPath: '/docs/public.json',
                    documentation: {
                        info: { title: 'Public API', version: '1.0.0' }
                    }
                },
                {
                    name: 'Internal API',
                    specPath: '/docs/internal.json',
                    documentation: {
                        info: { title: 'Internal API', version: '1.0.0' }
                    },
                    exclude: { tags: ['internal'] }
                }
            ]
        })
    )
    .listen(8080)
```

With Scalar, the documents appear in the source selector. Each document gets its own JSON spec endpoint while the UI stays at `path`.

# config

## enabled
@default true
Enable/Disable the plugin

## openapiVersion
@default '3.0.3'

OpenAPI specification version to emit. Supports OpenAPI `3.0.x` and `3.1.x`.

## documentation
OpenAPI documentation information

@see https://spec.openapis.org/oas/latest.html

## embedSpec
@default false

Embed the OpenAPI schema directly into the documentation page when possible.

This is discouraged unless you specifically need an inline spec.

## exclude
Configuration to exclude paths or methods from documentation

## exclude.methods
List of methods to exclude from documentation

## exclude.paths
List of paths to exclude from documentation

## exclude.staticFile
@default true

Exclude static file routes from documentation

## exclude.tags
List of tags to exclude from documentation

## Runtime exclusion helpers

The plugin exposes helpers on `app.openapi` to change exclusions after setup:

```typescript
const app = new Elysia().use(openapi())

app.openapi
    .addExcludedPaths('/health', /^\/internal/)
    .addExcludedTags('internal')
    .addExcludedMethods('options', 'head')

app.openapi.getExclusion()
```

Available helpers:

- `setExclusion(exclude)`
- `addExcludedPaths(...paths)`
- `removeExcludedPaths(...paths)`
- `addExcludedTags(...tags)`
- `removeExcludedTags(...tags)`
- `addExcludedMethods(...methods)`
- `removeExcludedMethods(...methods)`
- `getExclusion()`

Paths may be strings or regular expressions. Changes invalidate the cached schema automatically.

## path
@default '/openapi'

The endpoint to expose OpenAPI documentation frontend

## provider
@default 'scalar'

OpenAPI documentation frontend between:
- [Scalar](https://github.com/scalar/scalar)
- [SwaggerUI](https://github.com/swagger-api/swagger-ui)
- null: disable frontend

## documentations
Configure multiple OpenAPI documents while keeping a single documentation UI.

Each entry supports:
- `name`
- `specPath`
- `documentation`
- `exclude`
- `references`
- `mapJsonSchema`

When `provider` is `scalar`, multiple entries appear in the Scalar source dropdown.
Each entry registers its own JSON spec route while the UI remains at the single `path`.

## references
Additional OpenAPI reference for each endpoint

## mapJsonSchema
Mapping from a Standard Schema vendor to a JSON Schema converter.

Useful for schema libraries that don't expose JSON Schema directly:

```typescript
import { toJsonSchema } from '@valibot/to-json-schema'

openapi({
    mapJsonSchema: {
        valibot: toJsonSchema
    }
})
```

## scalar
Scalar configuration, refers to [Scalar config](https://github.com/scalar/scalar/blob/main/documentation/configuration.md)

## specPath
@default '/${path}/json'

The endpoint to expose OpenAPI specification in JSON format

## swagger
Swagger config, refers to [Swagger config](https://swagger.io/docs/open-source-tools/swagger-ui/usage/configuration/)
