import preact from '@preact/preset-vite'
import path from 'node:path'
import type { Plugin } from 'rollup'
import { defineConfig } from 'vite'
import WindiCSS from 'vite-plugin-windicss'

const PRODUCTION = 'production'
const DEVELOPMENT = 'development'

const environment = process.env.NODE_ENV === PRODUCTION ? PRODUCTION : DEVELOPMENT
const is_production = environment === PRODUCTION

const root = `${process.cwd()}/src`
const dist = `${process.cwd()}/dist`

const noparse = () =>
  ({
    enforce: 'pre',
    name: 'noparse',
    transform(code: string, id: string) {
      if (id.endsWith('?noparse')) {
        const encoded = Buffer.from(unescape(encodeURIComponent(code))).toString('base64')
        return {
          code: `const url = "data:text/javascript;base64," + "${encoded}";
                  const f = new Function("u", "return import(u)");
                  export default () => f(/* @vite-ignore */ url);
                `
        }
      }
      if (id.endsWith('?noparse-umd')) {
        return {
          code: `const m = { exports: {}};
                  new Function('module', 'exports', ${JSON.stringify(code)})(m, m.exports);
                  export default m.exports
                `
        }
      }
    }
  } as Plugin)

export default defineConfig({
  build: {
    assetsDir: 'assets',
    chunkSizeWarningLimit: 500,
    emptyOutDir: true,
    minify: is_production ? 'terser' : undefined,
    outDir: dist,
    rollupOptions: {
      input: {
        index: `${path.resolve(root, 'index.html')}/`
      },
      output: {
        assetFileNames: is_production ? 'assets/[hash][extname]' : 'assets/[name]-[hash][extname]',
        chunkFileNames: is_production ? 'assets/[hash].js' : 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name].[hash].js',
        manualChunks: {
          vendor: ['preact']
        }
      }
    },
    terserOptions: is_production
      ? {
          compress: {
            drop_console: true
          }
        }
      : undefined
  },
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
    jsxInject: `import { h, Fragment } from 'preact'`
  },
  plugins: [preact(), noparse(), WindiCSS()],
  resolve: {
    alias: {
      react: 'preact/compat',
      '~/': `${root}/`
    }
  },
  root,
  server: {
    port: 3000
  }
})
