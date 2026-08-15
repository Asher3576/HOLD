import { build } from 'esbuild'
import { cpSync, mkdirSync } from 'node:fs'

mkdirSync('dist', { recursive: true })

await build({
  entryPoints: {
    background: 'src/background.ts',
    content: 'src/content/index.ts',
    popup: 'src/popup/popup.ts',
  },
  bundle: true,
  format: 'iife',
  outdir: 'dist',
  target: 'chrome120',
})

cpSync('src/popup/popup.html', 'dist/popup.html')
cpSync('manifest.json', 'dist/manifest.json')

console.log('extension built → dist/ (chrome://extensions → 압축해제된 확장 프로그램 로드)')
