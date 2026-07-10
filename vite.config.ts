import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { advisorChatPlugin } from './vite-plugin-advisor-chat.js'

const repoName = 'hujia-shenshan'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isGitHubPages = process.env.GITHUB_ACTIONS === 'true'
  return {
    base: isGitHubPages ? `/${repoName}/` : '/',
    plugins: [react(), tailwindcss(), advisorChatPlugin(env)],
    server: {
      host: true,
      port: 5173,
      allowedHosts: true,
    },
    preview: {
      host: true,
      port: 4173,
      allowedHosts: true,
    },
  }
})