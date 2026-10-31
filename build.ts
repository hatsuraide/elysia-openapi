import { $ } from 'bun'
import { readdirSync, renameSync } from 'node:fs'
import { join } from 'node:path'
import { build } from 'tsup'

const entry = {
	index: 'src/index.ts',
	openapi: 'src/openapi.ts',
	types: 'src/types.ts',
	'gen/index': 'src/gen/index.ts',
	'swagger/index': 'src/swagger/index.ts',
	'swagger/types': 'src/swagger/types.ts',
	'scalar/index': 'src/scalar/index.ts',
	'scalar/theme': 'src/scalar/theme.ts'
}

const configs = [
	{
		entry,
		format: ['esm'],
		outDir: 'dist',
		outExtension: () => ({ js: '.mjs' }),
		target: 'node20',
		dts: true,
		clean: true,
		splitting: false,
		sourcemap: false,
		external: ['typescript', '@sinclair/typebox']
	},
	{
		entry,
		format: ['cjs'],
		outDir: 'dist/cjs',
		outExtension: () => ({ js: '.js' }),
		target: 'node20',
		dts: true,
		clean: false,
		splitting: false,
		sourcemap: false,
		external: ['typescript', '@sinclair/typebox']
	}
]

for (const config of configs)
	await build({
		...config,
		format: [...config.format] as ('esm' | 'cjs')[]
	})

// tsup names ESM declaration files `.d.mts`; the published package uses `.d.ts`.
for (const file of readdirSync('dist', { recursive: true })) {
	const path = String(file)
	if (!path.endsWith('.d.mts')) continue

	renameSync(join('dist', path), join('dist', path.slice(0, -6) + '.d.ts'))
}

if (import.meta.main) await $`tsc --noEmit`
