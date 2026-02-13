import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // FIX: Force all libraries to use the single copy of React in your node_modules
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
})