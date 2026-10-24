import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // base 設成 './'：打包後所有路徑都是相對路徑，
  // 放到 GitHub Pages 的子資料夾 (/lis_noicenocow.2026/) 也不會壞掉
  base: './',
})
