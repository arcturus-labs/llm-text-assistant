import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/games/adventure': 'http://localhost:5555'  // Adjust port to match your Flask server
    }
  }
})
