  import { defineConfig } from 'vite'
  import react from '@vitejs/plugin-react'

  // https://vite.dev/config/
  export default defineConfig({
    base: '/LitematicViewer/',
    plugins: [react()],
    define: {
      global: 'globalThis',
      native: 'globalThis',
    },
    resolve: {
      alias: {
        buffer: 'buffer/',
      },
    },
    build: {
      commonjsOptions: {
      transformMixedEsModules: true,
    },
    }
  })
