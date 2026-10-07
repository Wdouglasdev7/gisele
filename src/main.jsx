import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import App from './App.jsx'
import { iniciaAbertura } from './abertura.js'
import './estilo.css'

const raiz = document.getElementById('raiz')

// A escrita do monograma já veio pronta no HTML: o React reaproveita o mesmo miolo do SVG.
const svg = raiz.querySelector('.abertura-desenho')
globalThis.__GB_DESENHO__ = svg ? svg.innerHTML : ''

// Sem pré-render (npm run dev) o miolo é montado aqui; no build esta parte some.
if (import.meta.env.DEV && !svg) {
  const [{ default: d }, { desenhoHTML }] = await Promise.all([
    import('./dados/desenho.json'),
    import('./desenho-html.js'),
  ])
  globalThis.__GB_DESENHO__ = desenhoHTML(d)
}

const app = (
  <StrictMode>
    <App />
  </StrictMode>
)

if (!raiz.firstElementChild) {
  createRoot(raiz).render(app)
  // desenvolvimento: a abertura só existe depois que o React desenha a página
  requestAnimationFrame(() => requestAnimationFrame(iniciaAbertura))
} else {
  // Site publicado: o HTML já vem pronto e a abertura é só CSS. O React assume os cliques
  // quando a escrita termina, ou antes, no primeiro toque, tecla ou rolagem.
  const espera = iniciaAbertura()
  let feito = false
  const assume = () => {
    if (feito) return
    feito = true
    for (const ev of EVENTOS) window.removeEventListener(ev, assume, OPCOES)
    hydrateRoot(raiz, app)
  }
  const EVENTOS = ['pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll']
  const OPCOES = { passive: true, capture: true }
  if (espera > 0) {
    for (const ev of EVENTOS) window.addEventListener(ev, assume, OPCOES)
    setTimeout(assume, espera * 1000)
  } else {
    assume()
  }
}
