import imagens from '../dados/imagens.json'

/* Abertura: a foto da Gisele na loja abre o site. A loja começa "apagada" e o monograma GB
   é escrito em luz exatamente por cima da placa de metal da parede (o contorno foi
   vetorizado do logo e encaixado na placa da foto). A escrita passa por trás do globo da
   luminária, que tem um recorte próprio por cima. Quando o monograma termina, a luz acende,
   a escrita se dissolve na placa de verdade e o texto aparece.

   A escrita é só CSS (cada trecho da linha central anima o próprio traço dentro de uma
   máscara), então começa junto com a primeira pintura, antes do JavaScript. O brilho da
   ponta da caneta fica em src/abertura.js (lê o relógio da animação CSS e segue o traço).
   O miolo do SVG vem pronto do pré-render (src/desenho-html.js e main.jsx). */

const FW = imagens.heroi.w
const FH = imagens.heroi.h
const L = imagens.lampada
const pct = (v, total) => `${((v / total) * 100).toFixed(3)}%`
const srcset = (ext) => imagens.heroi.larguras.map((w) => `/img/heroi-${w}.${ext} ${w}w`).join(', ')

// globos das duas luminárias (centro e raio na foto 1672x941), para a luz que acende
const GLOBOS = [
  [476, 233, 92],
  [1195, 195, 95],
]
const luz = ([x, y, r]) => ({
  left: pct(x - r * 2.4, FW),
  top: pct(y - r * 2.4, FH),
  width: pct(r * 4.8, FW),
  height: pct(r * 4.8, FH),
})

export default function Abertura() {
  return (
    <header className="abertura" id="inicio" data-saida>
      <div className="abertura-cena">
        <div className="abertura-ambiente" aria-hidden="true" />
        <div className="abertura-foto">
          <div className="abertura-quadro">
            <picture>
              <source type="image/avif" srcSet={srcset('avif')} sizes="100vw" />
              <img
                className="abertura-img"
                src="/img/heroi-1280.webp"
                srcSet={srcset('webp')}
                sizes="100vw"
                width={FW}
                height={FH}
                alt="Gisele na loja, ao lado do monograma GB em rosé na parede de madeira"
                fetchPriority="high"
              />
            </picture>
            <div className="abertura-veu" aria-hidden="true" />
            <svg
              className="abertura-desenho"
              viewBox={`0 0 ${FW} ${FH}`}
              aria-hidden="true"
              focusable="false"
              dangerouslySetInnerHTML={{ __html: globalThis.__GB_DESENHO__ || '' }}
            />
            <img
              className="abertura-lampada"
              src="/img/lampada-escura.webp"
              alt=""
              aria-hidden="true"
              width={L.w}
              height={L.h}
              style={{ left: pct(L.x, FW), top: pct(L.y, FH), width: pct(L.w, FW) }}
            />
            {GLOBOS.map((g, i) => (
              <span key={i} className="abertura-luz" style={luz(g)} aria-hidden="true" />
            ))}
          </div>

          <div className="abertura-texto">
            <p className="abertura-sobre">Semijoias e prata 925 · Anápolis</p>
            <h1>
              <span className="abertura-nome">Gisele Beatriz</span>
              <span className="abertura-marca">Acessórios</span>
            </h1>
            <p className="abertura-frase">Há mais de 14 anos vendendo acessórios de qualidade.</p>
            <div className="abertura-acoes">
              <a className="botao botao-claro" href="#catalogo">
                Ver o catálogo
              </a>
              <a className="botao botao-contorno-claro" href="#visite">
                Visitar a loja
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="abertura-sombra" aria-hidden="true" />
    </header>
  )
}
