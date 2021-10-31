import { build } from 'esbuild';
import type { BuildOptions } from 'esbuild';
import fs from 'fs-extra';
import { fork } from 'child_process';
import type { ChildProcess } from 'child_process';

let childProcess: ChildProcess | null = null;

const startChildProcess = () => {
  if (!childProcess) {
    childProcess = fork('./build/index.js', {
      execArgv: ['--experimental-loader=@pipcook/boa/esm/loader.mjs'],
    });
    console.info('Service is up');
  }
};

const stopChildProcess = () => {
  if (childProcess) {
    childProcess.kill();
    childProcess = null;
    console.info('Service is down');
  }
};

const buildOptions: BuildOptions = {
  bundle: true,
  define: {},
  entryPoints: ['./src/index.ts'],
  external: [
    '@pipcook/boa',
    'co-body',
    'formidable',
    'fs-extra',
    'py:numpy',
    'py:scipy.optimize',
    'py:tensorflow',
    'type-is',
  ],
  format: 'esm',
  inject: [],
  loader: {},
  minify: false,
  minifyWhitespace: false,
  minifyIdentifiers: false,
  minifySyntax: false,
  outdir: './build/',
  platform: 'node',
  sourcemap: false,
  splitting: true,
  target: 'node14',
  watch: {
    onRebuild: () => {
      stopChildProcess();
      startChildProcess();
    },
  },
  write: true,
};

(async () => {
  await fs.emptyDir('build');
  await build(buildOptions);
  startChildProcess();
})();
