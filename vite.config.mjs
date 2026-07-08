import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

function stripOrigin(proxy) {
  proxy.on('proxyReq', (proxyReq) => {
    proxyReq.removeHeader('origin')
  })
}

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/portal': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        configure: stripOrigin,
      },
      '/admin/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        configure: stripOrigin,
      },
      '/media/public': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        configure: stripOrigin,
      },
    },
  },
})
