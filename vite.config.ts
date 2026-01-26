import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd())
    const proxyTarget = env.VITE_API_PROXY_TARGET || 'http://192.168.0.200:8085'

    return {
        plugins: [vue()],
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url))
            }
        },
        server: {
            port: 3000,
            host: '0.0.0.0',
            proxy: {
                '/sso': {
                    target: proxyTarget,
                    changeOrigin: true,
                    rewrite: (path) => path
                },
                '/admin': {
                    target: proxyTarget,
                    changeOrigin: true,
                    rewrite: (path) => path
                }
            }
        },
        build: {
            outDir: 'dist',
            assetsDir: 'assets',
            sourcemap: false,
            minify: 'terser',
            terserOptions: {
                compress: {
                    drop_console: true,
                    drop_debugger: true
                }
            },
            rollupOptions: {
                output: {
                    chunkFileNames: 'assets/js/[name]-[hash].js',
                    entryFileNames: 'assets/js/[name]-[hash].js',
                    assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
                    manualChunks: {
                        'vue-vendor': ['vue', 'vue-router', 'pinia'],
                        'element-plus': ['element-plus', '@element-plus/icons-vue'],
                        'crypto': ['crypto-js']
                    }
                }
            }
        }
    }
})
