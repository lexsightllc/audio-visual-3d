import { defineConfig, loadEnv } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    define: {
      'process.env': {
        GEMINI_API_KEY: JSON.stringify(env.GEMINI_API_KEY),
        VITE_GOOGLE_API_KEY: JSON.stringify(env.VITE_GOOGLE_API_KEY)
      }
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        'visual-controls': resolve(__dirname, './src/types/visual-controls.d.ts')
      },
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json']
    },
    server: {
      port: 3000,
      open: true,
      cors: true
    },
    build: {
      target: 'esnext',
      minify: 'esbuild',
      sourcemap: true,
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html')
        }
      }
    },
    optimizeDeps: {
      include: ['lit', '@lit/reactive-element']
    }
  };
});
