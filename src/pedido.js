/* Catálogo e as mensagens que vão para o WhatsApp da loja. */
import { config } from './dados/config.js'
import { produtos, categorias } from './dados/produtos.js'
import imagens from './dados/imagens.json'

export function fmt(n) {
  return 'R$ ' + Number(n).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

/* ---------- catálogo ---------- */

const porId = new Map(produtos.map((p) => [p.id, p]))
export const achaProduto = (id) => porId.get(id) || null

export const filtros = [{ id: 'todos', nome: 'Todas' }, ...categorias]

export function filtra(filtro) {
  return filtro === 'todos' ? produtos : produtos.filter((p) => p.cats.includes(filtro))
}

export function nomeCategoria(id) {
  const c = categorias.find((x) => x.id === id)
  return c ? c.nome : ''
}

const SINGULAR = { colares: 'Colar', brincos: 'Brinco', aneis: 'Anel', pulseiras: 'Pulseira' }

// o que a peça é, no singular: "Colar", "Conjunto · 3 peças", "Prata 925 · 10 modelos"
export function rotuloDe(p) {
  if (p.pecas.length > 1) return `Conjunto · ${p.pecas.length} peças`
  if (p.cats.includes('conjuntos')) return 'Conjunto'
  const base = p.cats.includes('prata') ? 'Prata 925' : SINGULAR[p.cats[0]] || 'Peça'
  if (p.opcoes && p.opcoes.porFoto) {
    return p.opcoes.lista ? `${base} · ${p.opcoes.lista.length} cores` : `${base} · ${p.fotos.length} modelos`
  }
  return base
}

/* ---------- fotos ---------- */

export function foto(nome) {
  const i = imagens._fotos[nome]
  const srcSet = i.larguras.map((w) => `/img/p/${nome}-${w}.webp ${w}w`).join(', ')
  const media = i.larguras[Math.min(1, i.larguras.length - 1)]
  return { src: `/img/p/${nome}-${media}.webp`, srcSet, w: i.w, h: i.h }
}

export function linkPost(p) {
  return `https://www.instagram.com/p/${p.post}/`
}

/* ---------- preços ---------- */

export const temPreco = (x) => config.mostrarPrecos && x.preco != null

export function resumoPreco(p) {
  if (!p.pecas.every(temPreco)) return 'Consultar valor'
  if (p.pecas.length === 1) return fmt(p.pecas[0].preco)
  const v = p.pecas.map((x) => x.preco)
  if (v.every((x) => x === v[0])) return `${fmt(v[0])} cada`
  return `${fmt(Math.min(...v))} a ${fmt(Math.max(...v))}`
}

// 5562991350635 -> (62) 99135-0635
export function telefone(numero = config.whatsapp) {
  const n = String(numero).replace(/^55/, '')
  const resto = n.slice(2)
  return `(${n.slice(0, 2)}) ${resto.slice(0, resto.length - 4)}-${resto.slice(-4)}`
}

/* ---------- mensagem ---------- */

function siteUrl() {
  if (typeof window === 'undefined') return ''
  return window.location.origin + '/'
}

export function linkDaPeca(p, fotoAtual) {
  const n = p.opcoes && p.opcoes.porFoto ? `/${fotoAtual + 1}` : ''
  return `${siteUrl()}#p/${p.id}${n}`
}

// Texto da escolha feita na ficha: opção (pela foto) e peças marcadas.
export function linhasDaEscolha(p, { marcadas, fotoAtual }) {
  const linhas = [`*${p.nome}*`]
  if (p.opcoes && p.opcoes.porFoto) {
    const nomeOp = p.opcoes.lista ? p.opcoes.lista[fotoAtual] : `foto ${fotoAtual + 1} de ${p.fotos.length}`
    linhas.push(`${p.opcoes.nome}: ${nomeOp}`)
  }
  const escolhidas = p.pecas.length === 1 ? p.pecas : marcadas.map((i) => p.pecas[i])
  if (p.pecas.length === 1) {
    linhas.push(temPreco(p.pecas[0]) ? fmt(p.pecas[0].preco) : 'Valor: a consultar')
  } else if (escolhidas.length) {
    for (const x of escolhidas) linhas.push(`• ${x.nome}: ${temPreco(x) ? fmt(x.preco) : 'a consultar'}`)
    if (escolhidas.length > 1 && escolhidas.every(temPreco)) {
      linhas.push(`Total: ${fmt(escolhidas.reduce((s, x) => s + x.preco, 0))}`)
    }
  } else {
    linhas.push('Quero saber mais sobre as peças.')
  }
  return linhas
}

export function mensagemPedido(p, escolha) {
  return [
    'Olá! Vi no site da Gisele Beatriz Acessórios e me interessei por:',
    '',
    ...linhasDaEscolha(p, escolha),
    '',
    'Ainda tem disponível?',
    linkDaPeca(p, escolha.fotoAtual),
  ].join('\n')
}

export function mensagemSeparar(p, escolha) {
  return [
    'Olá! Vi no site da Gisele Beatriz Acessórios e quero ver esta peça pessoalmente na loja:',
    '',
    ...linhasDaEscolha(p, escolha),
    '',
    'Vocês podem separar para mim?',
    linkDaPeca(p, escolha.fotoAtual),
  ].join('\n')
}

export function mensagemContato() {
  return 'Olá! Vim pelo site da Gisele Beatriz Acessórios e queria tirar uma dúvida.'
}

export function mensagemVisita() {
  return 'Olá! Vi o site da Gisele Beatriz Acessórios e quero passar na loja. Qual o melhor horário?'
}

export function linkWhatsApp(texto) {
  return `https://wa.me/${config.whatsapp}?text=${encodeURIComponent(texto)}`
}

/* ---------- vitrine ---------- */

// Distribui as peças em colunas, sempre na mais curta: a grade fica sem buraco e
// nenhuma foto precisa ser cortada.
export function distribui(lista, n) {
  const cols = Array.from({ length: n }, () => ({ itens: [], altura: 0 }))
  for (const p of lista) {
    const i = imagens._fotos[p.fotos[0]]
    let alvo = cols[0]
    for (const c of cols) if (c.altura < alvo.altura - 0.01) alvo = c
    alvo.itens.push(p)
    alvo.altura += i.h / i.w + 0.36
  }
  return cols.map((c) => c.itens)
}
