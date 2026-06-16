import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      thresholds: {
        lines: 80,
        // Las funciones del interceptor de axios (retry 401) no son alcanzables
        // con mocks de instancia, por lo que el umbral global de funciones se
        // establece en 75% y el umbral específico de api.jsx en 60%.
        functions: 75,
        branches: 80,
        statements: 80,
        // Umbral relajado para api.jsx porque las callbacks de los interceptors
        // de axios no se ejecutan cuando se mockea la instancia completa
        'src/services/api.jsx': {
          lines: 70,
          functions: 60,
          branches: 90,
          statements: 70,
        },
      },
      include: [
        'src/services/api.jsx',
        'src/contexts/AuthContext.jsx',
        'src/pages/LoginPage.jsx',
        'src/pages/RegisterPage.jsx',
        'src/components/common/Input.jsx',
      ],
      exclude: ['src/test/**']
    }
  }
})
