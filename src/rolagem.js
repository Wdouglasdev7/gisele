/* Efeitos de rolagem num laço só (mede tudo no evento de rolagem, sem IntersectionObserver:
   funciona com elemento recortado e também no navegador sem tela dos testes).

   [data-rolagem]  recebe --p de 0 (entrando por baixo) a 1 (saindo por cima).
   [data-palco]    seção alta com um palco preso na tela: --p de 0 (palco prendeu) a 1 (vai soltar).
   [data-saida]    recebe --s de 0 a 1 enquanto a seção seguinte sobe por cima dele (a abertura).
   .revela         ganha .dentro quando chega a 90% da altura da tela.
   <html>          ganha .rolou (saiu do topo) e .passou (a abertura ficou para trás). */

const alvos = new Set()
const palcos = new Set()
const saidas = new Set()
const pendentes = new Set()
let ligado = false

const limita = (v) => (v < 0 ? 0 : v > 1 ? 1 : v)

function medir() {
  const vh = window.innerHeight
  for (const el of alvos) {
    if (!el.isConnected) {
      alvos.delete(el)
      continue
    }
    const r = el.getBoundingClientRect()
    if (r.bottom < -vh || r.top > vh * 2) continue
    el.style.setProperty('--p', limita((vh - r.top) / (vh + r.height)).toFixed(4))
  }
  for (const el of palcos) {
    if (!el.isConnected) {
      palcos.delete(el)
      continue
    }
    const r = el.getBoundingClientRect()
    if (r.bottom < -vh || r.top > vh * 2) continue
    const curso = Math.max(1, r.height - vh)
    el.style.setProperty('--p', limita(-r.top / curso).toFixed(4))
  }
  for (const el of saidas) {
    const prox = el.nextElementSibling
    if (!prox) continue
    const r = prox.getBoundingClientRect()
    if (r.top > vh * 1.2) {
      el.style.setProperty('--s', '0')
      continue
    }
    el.style.setProperty('--s', limita(1 - r.top / vh).toFixed(4))
  }
  for (const el of pendentes) {
    if (!el.isConnected) {
      pendentes.delete(el)
      continue
    }
    if (el.getBoundingClientRect().top < vh * 0.9) {
      el.classList.add('dentro')
      pendentes.delete(el)
    }
  }
  const h = document.documentElement
  h.classList.toggle('rolou', window.scrollY > 8)
  h.classList.toggle('passou', window.scrollY > vh * 0.85)
}

// chamado direto no evento (passivo): é leve, e um rAF de espera não roda dentro
// do iframe dos testes
export function agenda() {
  medir()
}

export function escanear() {
  document.querySelectorAll('[data-rolagem]').forEach((el) => alvos.add(el))
  document.querySelectorAll('[data-palco]').forEach((el) => palcos.add(el))
  document.querySelectorAll('[data-saida]').forEach((el) => saidas.add(el))
  document.querySelectorAll('.revela:not(.dentro)').forEach((el) => pendentes.add(el))
  if (!ligado) {
    ligado = true
    window.addEventListener('scroll', agenda, { passive: true })
    window.addEventListener('resize', agenda)
  }
  medir()
}

export function rolarPara(id) {
  const el = document.getElementById(id)
  if (!el) return
  const suave = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ behavior: suave ? 'smooth' : 'instant', block: 'start' })
}
