/* Abertura sem React: o brilho da ponta da caneta e o fim da abertura.
   Roda assim que o script carrega, antes de o React assumir a página (main.jsx adia a
   hidratação para não disputar o processador com a escrita do monograma). */

export function iniciaAbertura() {
  const html = document.documentElement
  if (html.classList.contains('sem-abertura')) return 0
  const svg = document.querySelector('.abertura-desenho')
  const ponto = svg && svg.querySelector('.abertura-caneta')
  const grupo = svg && svg.querySelector('.abertura-trilhos')
  if (!ponto || !grupo) return 0
  const fim = Number(grupo.dataset.fim) || 3.3

  // relógio da animação CSS dos trechos: o brilho segue exatamente a escrita
  const primeiro = svg.querySelector('.gb-pedaco')
  const anim = primeiro && primeiro.getAnimations ? primeiro.getAnimations()[0] : null
  const inicio = anim && anim.startTime != null ? anim.startTime : document.timeline.currentTime
  const agora = () => (document.timeline.currentTime - inicio) / 1000

  const trilhos = [...svg.querySelectorAll('.abertura-trilho')].map((el) => ({
    el,
    b: Number(el.dataset.b),
    dur: Number(el.dataset.dur),
    comp: el.getTotalLength(),
  }))
  const passo = () => {
    const t = agora()
    const tr = trilhos.find((x) => t >= x.b && t < x.b + x.dur)
    if (tr) {
      const u = (t - tr.b) / tr.dur
      // a mesma curva usada para cronometrar os trechos (scripts/logo/gerar_desenho.py)
      const e = u * u * (3 - 2 * u) * 0.35 + u * 0.65
      const pt = tr.el.getPointAtLength(e * tr.comp)
      ponto.setAttribute('cx', pt.x.toFixed(1))
      ponto.setAttribute('cy', pt.y.toFixed(1))
      ponto.style.opacity = '1'
    } else {
      ponto.style.opacity = '0'
    }
    if (t < fim + 0.3) requestAnimationFrame(passo)
  }
  requestAnimationFrame(passo)

  const resta = Math.max(0, fim + 2.4 - agora())
  setTimeout(() => {
    try {
      sessionStorage.setItem('gb-abertura', '1')
    } catch {}
    html.classList.add('abertura-feita')
  }, resta * 1000)
  // segundos até a luz acender (quando a escrita termina): depois disso o React pode assumir
  return Math.max(0, fim + 0.25 - agora())
}
