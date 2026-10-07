import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  achaProduto,
  fmt,
  foto,
  linkPost,
  linkWhatsApp,
  mensagemPedido,
  mensagemSeparar,
  rotuloDe,
  temPreco,
} from '../pedido.js'
import { IconeAnterior, IconeCheck, IconeFechar, IconeProximo, IconeSacola, IconeWhats } from './Icones.jsx'

const useIsoLayout = typeof window === 'undefined' ? useEffect : useLayoutEffect

/* Ficha da peça: todas as fotos (passando para o lado, inteiras), descrição, as peças do
   conjunto para marcar e dois caminhos para o WhatsApp: pedir, ou pedir para separar e ver
   na loja. Em peça com modelos (prata 925, cores), a foto que está na tela é a escolhida. */
export default function Ficha({ estado, onFechar, onFoto }) {
  const p = estado ? achaProduto(estado.id) : null
  const [atual, setAtual] = useState(0)
  const [marcadas, setMarcadas] = useState([])
  const trilho = useRef(null)
  const fecharRef = useRef(null)
  const caixaRef = useRef(null)
  const atualRef = useRef(0)

  // abriu (ou trocou de peça): foto pedida no link e nada marcado
  useIsoLayout(() => {
    if (!p) return
    const i = Math.min(estado.foto || 0, p.fotos.length - 1)
    setAtual(i)
    atualRef.current = i
    setMarcadas([])
    const el = trilho.current
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: 'instant' })
  }, [p && p.id])

  // trava a página por trás, leva o foco para a ficha e devolve ao fechar
  useEffect(() => {
    if (!p) return
    const html = document.documentElement
    const antes = document.activeElement
    html.classList.add('travado')
    fecharRef.current && fecharRef.current.focus({ preventScroll: true })
    return () => {
      html.classList.remove('travado')
      if (antes && antes.focus) antes.focus({ preventScroll: true })
    }
  }, [p && p.id])

  useEffect(() => {
    if (!p) return
    const tecla = (e) => {
      if (e.key === 'Escape') onFechar()
      else if (e.key === 'ArrowRight') ir(atualRef.current + 1)
      else if (e.key === 'ArrowLeft') ir(atualRef.current - 1)
      else if (e.key === 'Tab') prendeFoco(e)
    }
    document.addEventListener('keydown', tecla)
    return () => document.removeEventListener('keydown', tecla)
  })

  if (!p) return null

  const n = p.fotos.length
  const escolha = { marcadas: [...marcadas].sort((a, b) => a - b), fotoAtual: atual }
  const variasPecas = p.pecas.length > 1
  const marcadasPecas = escolha.marcadas.map((i) => p.pecas[i])
  const total = marcadasPecas.length > 1 && marcadasPecas.every(temPreco)
    ? marcadasPecas.reduce((s, x) => s + x.preco, 0)
    : null

  function ir(i) {
    const el = trilho.current
    if (!el) return
    const alvo = Math.max(0, Math.min(n - 1, i))
    const suave = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollTo({ left: alvo * el.clientWidth, behavior: suave ? 'smooth' : 'instant' })
  }

  function aoRolar() {
    const el = trilho.current
    if (!el) return
    const i = Math.round(el.scrollLeft / Math.max(1, el.clientWidth))
    if (i !== atualRef.current) {
      atualRef.current = i
      setAtual(i)
      if (p.opcoes && p.opcoes.porFoto && onFoto) onFoto(i)
    }
  }

  function alterna(i) {
    setMarcadas((m) => (m.includes(i) ? m.filter((x) => x !== i) : [...m, i]))
  }

  function prendeFoco(e) {
    const caixa = caixaRef.current
    if (!caixa) return
    const itens = caixa.querySelectorAll('button:not([disabled]), a[href], input')
    if (!itens.length) return
    const primeiro = itens[0]
    const ultimo = itens[itens.length - 1]
    if (e.shiftKey && document.activeElement === primeiro) {
      e.preventDefault()
      ultimo.focus()
    } else if (!e.shiftKey && document.activeElement === ultimo) {
      e.preventDefault()
      primeiro.focus()
    }
  }

  let rotuloPedido = 'Pedir pelo WhatsApp'
  if (variasPecas && marcadasPecas.length === 0) rotuloPedido = 'Perguntar pelo WhatsApp'
  else if (variasPecas) rotuloPedido = `Pedir ${marcadasPecas.length} ${marcadasPecas.length === 1 ? 'peça' : 'peças'} pelo WhatsApp`

  const opcaoNome = p.opcoes && p.opcoes.porFoto
    ? p.opcoes.lista
      ? p.opcoes.lista[atual]
      : `foto ${atual + 1} de ${n}`
    : null

  return (
    <div className="ficha" role="dialog" aria-modal="true" aria-labelledby="ficha-titulo">
      <div className="ficha-fundo" onClick={onFechar} aria-hidden="true" />
      <div className="ficha-caixa" ref={caixaRef}>
        <button type="button" className="ficha-fechar" ref={fecharRef} onClick={onFechar} aria-label="Fechar">
          <IconeFechar width="22" height="22" />
        </button>

        <div className="ficha-galeria">
          <div className="ficha-trilho" ref={trilho} onScroll={aoRolar} tabIndex={-1}>
            {p.fotos.map((nome, i) => {
              const f = foto(nome)
              return (
                <figure className="ficha-slide" key={nome}>
                  <img
                    src={f.src}
                    srcSet={f.srcSet}
                    sizes="(min-width: 900px) 46vw, 100vw"
                    width={f.w}
                    height={f.h}
                    alt={`${p.nome}, foto ${i + 1} de ${n}`}
                    loading={Math.abs(i - (estado.foto || 0)) <= 1 ? 'eager' : 'lazy'}
                    decoding="async"
                  />
                </figure>
              )
            })}
          </div>
          {n > 1 && (
            <>
              <button
                type="button"
                className="ficha-seta ficha-seta-ant"
                onClick={() => ir(atual - 1)}
                disabled={atual === 0}
                aria-label="Foto anterior"
              >
                <IconeAnterior width="20" height="20" />
              </button>
              <button
                type="button"
                className="ficha-seta ficha-seta-prox"
                onClick={() => ir(atual + 1)}
                disabled={atual === n - 1}
                aria-label="Próxima foto"
              >
                <IconeProximo width="20" height="20" />
              </button>
              <div className="ficha-pontos" aria-hidden="true">
                {p.fotos.map((nome, i) => (
                  <span key={nome} className={i === atual ? 'ativo' : ''} />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="ficha-info">
          <p className="sobretitulo">{rotuloDe(p)}</p>
          <h2 id="ficha-titulo">{p.nome}</h2>
          <p className="ficha-desc">{p.desc}</p>

          {n > 1 && (
            <div className="ficha-miniaturas" role="group" aria-label="Fotos da peça">
              {p.fotos.map((nome, i) => {
                const f = foto(nome)
                return (
                  <button
                    key={nome}
                    type="button"
                    className="ficha-mini"
                    aria-pressed={i === atual}
                    aria-label={`Ver foto ${i + 1}`}
                    onClick={() => ir(i)}
                  >
                    <img src={`/img/p/${nome}-${360}.webp`} alt="" width={f.w} height={f.h} loading="lazy" decoding="async" />
                  </button>
                )
              })}
            </div>
          )}

          {opcaoNome && (
            <p className="ficha-opcao">
              {p.opcoes.nome}: <strong>{opcaoNome}</strong>
              <span>{p.opcoes.lista ? 'Passe as fotos para trocar.' : 'Passe as fotos e peça a que está na tela.'}</span>
            </p>
          )}

          {variasPecas ? (
            <fieldset className="ficha-pecas">
              <legend>Marque as peças que você quer</legend>
              {p.pecas.map((x, i) => {
                const on = marcadas.includes(i)
                return (
                  <label key={x.nome} className={`ficha-peca${on ? ' marcada' : ''}`}>
                    <input type="checkbox" checked={on} onChange={() => alterna(i)} />
                    <span className="ficha-caixinha" aria-hidden="true">
                      <IconeCheck width="14" height="14" />
                    </span>
                    <span className="ficha-peca-nome">{x.nome}</span>
                    <span className="ficha-peca-preco">{temPreco(x) ? fmt(x.preco) : 'Consultar'}</span>
                  </label>
                )
              })}
              {total != null && (
                <p className="ficha-total">
                  Total das peças marcadas <strong>{fmt(total)}</strong>
                </p>
              )}
            </fieldset>
          ) : (
            <p className="ficha-preco">{temPreco(p.pecas[0]) ? fmt(p.pecas[0].preco) : 'Consultar valor'}</p>
          )}

          <div className="ficha-acoes">
            <a
              className="botao botao-cheio"
              href={linkWhatsApp(mensagemPedido(p, escolha))}
              target="_blank"
              rel="noopener"
            >
              <IconeWhats width="19" height="19" />
              {rotuloPedido}
            </a>
            <a
              className="botao botao-linha"
              href={linkWhatsApp(mensagemSeparar(p, escolha))}
              target="_blank"
              rel="noopener"
            >
              <IconeSacola width="19" height="19" />
              Separar para ver na loja
            </a>
          </div>
          <p className="ficha-nota">
            A mensagem já vai com o nome{variasPecas ? ', as peças marcadas' : ''} e o valor. Valores do Instagram da
            loja, confirmados no atendimento.{' '}
            <a href={linkPost(p)} target="_blank" rel="noopener">
              Ver o post
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
