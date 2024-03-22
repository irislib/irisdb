import react from '@vitejs/plugin-react';
import topLevelAwait from 'vite-plugin-top-level-await';
import wasm from 'vite-plugin-wasm';
import { defineConfig } from 'vitest/config';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [topLevelAwait(), wasm(), react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-stuff': ['react', 'react-dom', 'react-router-dom'],
          'nostr-dev-kit': ['@nostr-dev-kit/ndk', '@nostr-dev-kit/ndk-cache-dexie'],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
  },
});
