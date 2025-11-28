import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Cast process to any to fix "Property 'cwd' does not exist on type 'Process'" TypeScript error
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    define: {
      // Polyfill process.env for the Google GenAI SDK usage in the code
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  };
});
