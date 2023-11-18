import { defineConfig } from 'tsup'

export default defineConfig({
	entry: ['./src/**/*'],
	outDir: 'dist',
	clean: true,
	format: 'esm',
	target: 'es2022',
	silent: true,
	bundle: false,
	splitting: true,
	sourcemap: true,
})
