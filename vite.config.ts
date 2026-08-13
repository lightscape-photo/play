import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // 使用相對路徑，讓打包後的資源不論部署在 GitHub Pages 的
  // 哪一層子路徑（https://<user>.github.io/<repo>/）都能正確載入
  base: './',
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
