import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
export default defineConfig({
  define: {
    __BUILD_INFO__: JSON.stringify({
      sha: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
      dirty: Boolean(execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim()),
      assets: createHash('sha256').update(readFileSync('art/manifest.json')).digest('hex'),
      builtAt: new Date().toISOString(),
    }),
  },
  base: './',
  build: { target: 'es2022', rollupOptions: { output: { manualChunks: { phaser: ['phaser'] } } } },
});
