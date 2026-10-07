/* Depois do build: escreve o site já renderizado dentro do dist/index.html
   e põe o CSS inteiro no <head>. O celular pinta a página com o primeiro
   pacote do HTML, sem esperar o JavaScript nem um segundo arquivo de estilo. */
import { readFileSync, writeFileSync, rmSync, readdirSync, unlinkSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const raiz = resolve(import.meta.dirname, '..')
const dist = resolve(raiz, 'dist')
const ssr = resolve(raiz, '.ssr')

const { render } = await import(pathToFileURL(resolve(ssr, 'entry-server.js')).href)
let html = readFileSync(resolve(dist, 'index.html'), 'utf8')

html = html.replace('<!--app-->', render())

html = html.replace(/<link rel="stylesheet"[^>]*href="\/assets\/([^"]+\.css)"[^>]*>/, (_, arquivo) => {
  const css = readFileSync(resolve(dist, 'assets', arquivo), 'utf8')
  unlinkSync(resolve(dist, 'assets', arquivo))
  return `<style>${css}</style>`
})

writeFileSync(resolve(dist, 'index.html'), html)
rmSync(ssr, { recursive: true, force: true })

const js = readdirSync(resolve(dist, 'assets')).filter((f) => f.endsWith('.js'))
console.log(`pré-render ok: index.html com ${(html.length / 1024).toFixed(1)} KB, js: ${js.join(', ')}`)
