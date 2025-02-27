import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/',  // If deployed at the root of your domain (e.g., https://yourdomain.com/)
  build: {
    outDir: 'dist',  // Where Vite will output the built files
  },
  plugins: [react()],
  server: {
    proxy: {
      // Proxy for API requests
      '/api': {
        target: 'http://localhost:3000', // Backend server
        changeOrigin: true,            // Ensures the Host header matches the target
        rewrite: (path) => path.replace(/^\/api/, ''), // Optionally rewrite paths
      },
      // Proxy for WebSocket connections (Socket.IO)
      '/socket.io': {
        target: 'http://localhost:3000', // Backend server
        ws: true,                       // Enable WebSocket proxying
        changeOrigin: true,
      },
    },
  },
});
