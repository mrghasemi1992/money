/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      // Barrel files listed explicitly, not via a `**/index.ts` glob — that
      // pattern also matches `index.tsx` component entry files and silently
      // drops them from the report (a real quirk hit while wiring this up).
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/main.tsx',
        'src/components/index.ts',
        'src/components/primitives/index.ts',
        'src/stores/index.ts',
        'src/i18n/index.ts',
      ],
    },
  },
});
