import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// IMPORTANT: base must match your GitHub repo name for GitHub Pages to serve
// assets correctly, e.g. if your repo is github.com/you/finstat-intelligence
// then base should be '/finstat-intelligence/'
export default defineConfig({
  plugins: [react()],
  base: '/finstat-intelligence/',
})
