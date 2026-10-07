import { useEffect, useState } from 'react'
import { distribui, filtra, filtros, foto, resumoPreco, rotuloDe } from '../pedido.js'
import { escanear } from '../rolagem.js'

/* Vitrine em colunas (2 no celular, 3 no tablet, 4 no computador). Cada foto entra inteira,
   na proporção original; a peça vai para a coluna mais curta. Tocar abre a ficha. */

function Cartao({ p, onAbrir }) {
  const f = foto(p.fotos[0])
  return (
    <article className="cartao revela">
      <button type="button" className="cartao-botao" onClick={() => onAbrir(p.id)}>
        <span className="cartao-foto" style={{ aspectRatio: `${f.w} / ${f.h}` }}>
          <img
            src={f.src}
            srcSet={f.srcSet}
            sizes="(min-width: 1100px) 23vw, (min-width: 700px) 31vw, 47vw"
            width={f.w}
            height={f.h}
            alt=""
            loading="lazy"
            decoding="async"
          />
          {p.fotos.length > 1 && <span className="cartao-qtd">{p.fotos.length} fotos</span>}
        </span>
        <span className="cartao-info">
          <span className="cartao-rotulo">{rotuloDe(p)}</span>
          <span className="cartao-nome">{p.nome}</span>
          <span className="cartao-preco">{resumoPreco(p)}</span>
        </span>
      </button>
    </article>
  )
}

export default function Catalogo({ onAbrir }) {
  const [filtro, setFiltro] = useState('todos')
  const [colunas, setColunas] = useState(2)

  useEffect(() => {
    const m3 = window.matchMedia('(min-width: 700px)')
    const m4 = window.matchMedia('(min-width: 1100px)')
    const ler = () => setColunas(m4.matches ? 4 : m3.matches ? 3 : 2)
    ler()
    m3.addEventListener('change', ler)
    m4.addEventListener('change', ler)
    return () => {
      m3.removeEventListener('change', ler)
      m4.removeEventListener('change', ler)
    }
  }, [])

  // cartões novos (troca de filtro ou de colunas) entram no laço dos efeitos de rolagem
  useEffect(() => {
    escanear()
  }, [filtro, colunas])

  const lista = filtra(filtro)
  const cols = distribui(lista, colunas)

  return (
    <section className="catalogo" id="catalogo" aria-labelledby="catalogo-titulo">
      <header className="catalogo-topo">
        <p className="sobretitulo revela">Catálogo</p>
        <h2 id="catalogo-titulo" className="revela">
          Escolha a sua <em>peça.</em>
        </h2>
        <p className="catalogo-sub revela">
          Toque na peça para ver todas as fotos. O pedido vai direto para o WhatsApp da loja, já
          com o nome e o valor da peça escolhida.
        </p>
      </header>

      <div className="filtros" role="group" aria-label="Filtrar o catálogo">
        {filtros.map((f) => {
          const n = filtra(f.id).length
          return (
            <button
              key={f.id}
              type="button"
              className="filtro"
              aria-pressed={filtro === f.id}
              onClick={() => setFiltro(f.id)}
            >
              {f.nome}
              <span className="filtro-n">{n}</span>
            </button>
          )
        })}
      </div>

      <div className="vitrine" style={{ '--cols': colunas }} aria-live="polite">
        {cols.map((col, i) => (
          <div className="vitrine-coluna" key={`${filtro}-${colunas}-${i}`}>
            {col.map((p) => (
              <Cartao key={p.id} p={p} onAbrir={onAbrir} />
            ))}
          </div>
        ))}
      </div>

      <p className="catalogo-nota">
        Peças e valores publicados no Instagram da loja. Disponibilidade e valor final são
        confirmados no atendimento pelo WhatsApp.
      </p>
    </section>
  )
}
