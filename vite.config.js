import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/main.tsx',
        'src/types.ts',
        'src/constants.ts',
        'eslint.config.js',
        '**/*.css',
        'vite.config.js',
        'src/utils.ts',
        'src/App.tsx',
        'src/reducers/*',
      ],
    },
  },
});
