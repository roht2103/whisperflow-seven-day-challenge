import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { funnelApiPlugin } from './server/apiPlugin.js';

export default defineConfig({
  plugins: [react(), funnelApiPlugin()],
  server: {
    port: 3000,
    host: true,
  },
  preview: {
    port: 3000,
    host: true,
  },
});

