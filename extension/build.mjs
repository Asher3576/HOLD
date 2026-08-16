import { build } from 'esbuild'
import { cpSync, mkdirSync } from 'node:fs'

mkdirSync('dist', { recursive: true })

await build({
  entryPoints: {
    background: 'src/background.ts',
    content: 'src/content/index.ts',
    sidepanel: 'src/sidepanel/sidepanel.ts',
  },
  bundle: true,
  format: 'iife',
  outdir: 'dist',
  target: 'chrome120',
})

cpSync('src/sidepanel/sidepanel.html', 'dist/sidepanel.html')
cpSync('manifest.json', 'dist/manifest.json')
cpSync('icons', 'dist/icons', { recursive: true })

console.log('extension built → dist/ (chrome://extensions → 압축해제된 확장 프로그램 로드)')
