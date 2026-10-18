import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'lucide-react': path.resolve(__dirname, './src/components/icons.jsx'),
    },
  },
  server: {
    port: 5173,
    open: false,
  },
});
