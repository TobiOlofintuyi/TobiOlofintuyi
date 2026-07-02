// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// clause.ink — static, client-side only. No SSR, no server functions, no backend.
// GR-01 Boundary: the cell is sealed. Nothing leaves the visitor's browser
// except an action the human explicitly fires (copy, mailto, form submit).
export default defineConfig({
  site: 'https://clause.ink',
  output: 'static',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
