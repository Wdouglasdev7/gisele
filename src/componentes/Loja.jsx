import imagens from '../dados/imagens.json'
import { config } from '../dados/config.js'
import { IconeBrilho, IconeEscudo, IconeEstrela, IconeRelogio } from './Icones.jsx'

/* A loja por dentro. Esta seção sobe por cima da abertura (que fica presa na tela e recua).
   Textos: o site antigo da loja e a bio. Números: bio do Instagram e ficha do Google. */

const srcset = (ext) => imagens.loja.larguras.map((w) => `/img/loja-${w}.${ext} ${w}w`).join(', ')
const TAMANHOS = '(min-width: 980px) 52vw, calc(100vw - 40px)'

export default function Loja() {
  return (
    <section className="loja" id="loja" aria-labelledby="loja-titulo">
      <div className="loja-selo" aria-hidden="true">
        <img src="/img/gb-branco.svg" alt="" width="610" height="611" />
      </div>
      <div className="loja-grade">
        <figure className="loja-foto revela" data-rolagem>
          <div className="loja-moldura">
            <picture>
              <source type="image/avif" srcSet={srcset('avif')} sizes={TAMANHOS} />
              <img
                src="/img/loja-960.webp"
                srcSet={srcset('webp')}
                sizes={TAMANHOS}
                width={imagens.loja.w}
                height={imagens.loja.h}
                alt="A loja por dentro: paredes rosa, prateleiras de madeira com colares e brincos expostos e uma mesa de atendimento ao fundo"
                loading="lazy"
                decoding="async"
              />
            </picture>
          </div>
          <figcaption>Av. Tiradentes, 481 · Centro de Anápolis</figcaption>
        </figure>

        <div className="loja-texto">
          <p className="sobretitulo revela">A loja</p>
          <h2 id="loja-titulo" className="revela">
            Descubra o poder dos <em>detalhes.</em>
          </h2>
          <p className="revela">
            Aqui, cada peça é escolhida com carinho para valorizar a sua beleza e refletir a sua
            personalidade. O acessório certo transforma um look e eleva a autoestima.
          </p>
          <p className="revela">
            Um ambiente acolhedor, pensado para você se sentir especial desde o primeiro momento.
            Seja para um grande evento ou para o dia a dia, tem uma peça esperando por você.
          </p>

          <ul className="loja-fatos">
            <li className="revela">
              <IconeRelogio width="22" height="22" />
              <strong>+14 anos</strong>
              <span>vendendo acessórios de qualidade</span>
            </li>
            <li className="revela">
              <IconeEscudo width="22" height="22" />
              <strong>1 ano</strong>
              <span>de garantia nas semijoias</span>
            </li>
            <li className="revela">
              <IconeBrilho width="22" height="22" />
              <strong>Prata 925</strong>
              <span>brincos, colares e mais na prata</span>
            </li>
            <li className="revela">
              <IconeEstrela width="20" height="20" />
              <strong>{config.nota.valor}</strong>
              <span>no Google, com {config.nota.avaliacoes} avaliações</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}
