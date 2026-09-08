import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 2323,
    strictPort: true,
    host: true,
    open: false,
    watch: {
      ignored: ['**/public/**']
    }
  }
})
