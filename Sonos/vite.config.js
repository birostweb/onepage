import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
// Tailwind CSS is now configured via PostCSS and does not need a special plugin.
export default defineConfig({
  plugins: [vue()],
})
