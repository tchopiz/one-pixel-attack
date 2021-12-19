import { ip } from 'address';
import { serve, type BuildOptions, type ServeOptions } from 'esbuild';
import { readJson } from 'fs-extra';

const serveOptions: ServeOptions = {
  port: 3000,
  host: 'localhost',
  servedir: 'public',
  onRequest: ({ method, path, status }) => {
    console.log(`${status} ${method} ${path}`);
  },
};

const buildOptions: BuildOptions = {
  bundle: true,
  define: {},
  entryPoints: ['./src/index.tsx'],
  external: [],
  format: 'esm',
  inject: ['./scripts/react-shim.ts'],
  loader: {
    '.ts': 'tsx',
    '.avif': 'file',
    '.bmp': 'file',
    '.gif': 'file',
    '.jpg': 'file',
    '.jpeg': 'file',
    '.png': 'file',
    '.webp': 'file',
    '.svg': 'file',
  },
  minify: false,
  minifyWhitespace: false,
  minifyIdentifiers: false,
  minifySyntax: false,
  outdir: './public/static/',
  platform: 'browser',
  sourcemap: true,
  splitting: true,
  target: 'es6',
  watch: false,
  write: false,
  metafile: false,
  publicPath: '/static/',
  sourceRoot: '/static/',
};

(async () => {
  const { name } = await readJson('package.json');
  const { host, port } = await serve(serveOptions, buildOptions);
  const appName = `\x1b[1m${name}\x1b[22m`;
  const protocol = process.env.HTTPS === 'true' ? 'https' : 'http';
  const outputs = [
    { protocol, hostname: host, port },
    { protocol, hostname: ip() || '', port },
  ]
    .filter((value, index) => {
      if (index === 0) return true;
      const lan = value.hostname;
      return /^10[.]|^172[.](1[6-9]|2[0-9]|3[0-1])[.]|^192[.]168[.]/.test(lan);
    })
    .map((output, index) => ({
      label:
        index === 0
          ? '\x1b[1mLocal:            \x1b[22m'
          : '\x1b[1mOn Your Network:  \x1b[22m',
      protocol: output.protocol,
      hostname: output.hostname,
      port: `\x1b[1m${output.port}\x1b[22m`,
    }));
  const only = outputs.length === 1;
  console.log('\x1b[32mCompiled successfully!\x1b[39m');
  console.log();
  console.log(`You can now view ${appName} in the browser.`);
  console.log();
  for (const { label, protocol, hostname, port } of outputs) {
    console.log(`  ${only ? '' : label}${protocol}://${hostname}:${port}`);
  }
  console.log();
  console.log('Note that the development build is not optimized.');
})();
