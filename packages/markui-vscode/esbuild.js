const esbuild = require('esbuild');

const isProduction = process.argv.includes('--production');
const isWatch = process.argv.includes('--watch');

/** @type {esbuild.BuildOptions} */
const extensionConfig = {
	entryPoints: ['src/extension.ts'],
	bundle: true,
	outfile: 'dist/extension.js',
	external: ['vscode'],
	format: 'cjs',
	platform: 'node',
	target: 'es2020',
	sourcemap: !isProduction,
	minify: isProduction,
};

/** @type {esbuild.BuildOptions} */
const previewScriptConfig = {
	entryPoints: ['src/markdown/preview-script.ts'],
	bundle: true,
	outfile: 'dist/markdown-preview.js',
	format: 'iife',
	platform: 'browser',
	target: 'es2020',
	sourcemap: !isProduction,
	minify: isProduction,
};

/** @type {esbuild.BuildOptions} */
const notebookRendererConfig = {
	entryPoints: ['src/markdown/notebook-renderer.ts'],
	bundle: true,
	outfile: 'dist/notebook-renderer.js',
	format: 'iife',
	platform: 'browser',
	target: 'es2020',
	sourcemap: !isProduction,
	minify: isProduction,
};

async function main() {
	const configs = [extensionConfig, previewScriptConfig, notebookRendererConfig];

	if (isWatch) {
		const contexts = await Promise.all(
			configs.map(config => esbuild.context(config))
		);
		await Promise.all(contexts.map(ctx => ctx.watch()));
		console.log('[watch] Build started...');
	} else {
		await Promise.all(configs.map(config => esbuild.build(config)));
		console.log('Build complete.');
	}
}

main().catch(err => {
	console.error(err);
	process.exit(1);
});
