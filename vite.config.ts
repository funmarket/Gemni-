import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: { 
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY), 
      'process.env.GOOGLE_MAPS_PLATFORM_KEY': JSON.stringify(env.GOOGLE_MAPS_PLATFORM_KEY || ''),
      'global': 'globalThis' 
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    resolve: { alias: { '@': path.resolve(__dirname, './src'), 'buffer': 'buffer/' } },
    optimizeDeps: { include: ['buffer'] },
    build: {
      sourcemap: false,
      minify: 'esbuild',
      cssCodeSplit: false,
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        maxParallelFileOps: 2,
        cache: false,
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('three') || id.includes('@react-three')) {
                return 'three-vendor';
              }
              if (id.includes('@solana') || id.includes('@noble') || id.includes('elliptic')) {
                return 'solana-vendor';
              }
              if (id.includes('recharts') || id.includes('d3')) {
                return 'charts-vendor';
              }
              if (id.includes('firebase')) {
                return 'firebase-vendor';
              }
              return 'vendor';
            }
          }
        }
      }
    }
  };
});
