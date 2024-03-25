import { defineConfig } from 'vitest/config';

// https://vitejs.dev/config/
export default defineConfig({
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
