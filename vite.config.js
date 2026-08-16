import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // For GitHub Pages: set base to your repo name when deploying
  // e.g. base: '/gift-manager/'
  // Leave as '/' for local dev or if deploying to a custom domain / root
  base: '/',
})
