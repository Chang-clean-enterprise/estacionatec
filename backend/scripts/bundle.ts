import { build } from 'esbuild';

// Bundles the Lambda entry point into a single ESM file: dist/lambda/index.mjs
// (Lambda handler: index.handler). The banner provides `require` for CommonJS
// dependencies such as Express when they are bundled into ESM.
await build({
  entryPoints: ['src/lambda.ts'],
  outfile: 'dist/lambda/index.mjs',
  bundle: true,
  platform: 'node',
  target: 'node22',
  format: 'esm',
  sourcemap: true,
  banner: {
    js: "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);",
  },
  logLevel: 'info',
});
