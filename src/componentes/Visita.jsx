import { config } from '../dados/config.js'
import { linkWhatsApp, mensagemVisita, telefone } from '../pedido.js'
import { IconeEstrela, IconePino, IconeRelogio, IconeWhats } from './Icones.jsx'

/* Fim do site: o convite para conhecer a loja. O mapa é uma captura do Google com a loja no
   centro (duotom nas cores da marca); enquanto a seção passa ele aproxima e vira satélite.
   Tocar no mapa abre o perfil da loja no Google.
   Depoimentos: avaliações públicas da loja no Google (06/10/2026). */

const DEPOIMENTOS = [
  { texto: 'Sou apaixonada. Fora o astral da dona, que é de outro mundo.', autora: 'Milena A.' },
  { texto: 'A melhor loja, preços acessíveis e com a proprietária da melhor risada.', autora: 'Julieny O.' },
]

export default function Visita() {
  return (
    <section className="visita" id="visite" aria-labelledby="visita-titulo">
      <div className="visita-grade">
        <div className="visita-cabeca">
          <p className="sobretitulo revela">Visite a loja</p>
          <h2 id="visita-titulo" className="revela">
            Venha conhecer a loja <em>de pertinho.</em>
          </h2>
          <p className="visita-convite revela">
            Venha se encantar com o universo Gisele Beatriz, onde cada detalhe faz toda a diferença.
            Estamos no Centro de Anápolis, na Av. Tiradentes.
          </p>
        </div>

        <a
          className="visita-mapa revela"
          href={config.perfilGoogle}
          target="_blank"
          rel="noopener"
          aria-label="Abrir a Gisele Beatriz Acessórios no Google Maps"
          data-rolagem
        >
          <picture className="visita-camada visita-camada-mapa">
            <source media="(max-width: 760px)" srcSet="/img/mapa-m.webp" width="900" height="1376" />
            <img
              src="/img/mapa-1600.webp"
              width="1600"
              height="780"
              alt="Mapa do Centro de Anápolis com a loja marcada na Av. Tiradentes"
              loading="lazy"
              decoding="async"
            />
          </picture>
          <picture className="visita-camada visita-camada-sat">
            <source media="(max-width: 760px)" srcSet="/img/satelite-m.webp" width="900" height="1376" />
            <img src="/img/satelite-1600.webp" width="1600" height="780" alt="" loading="lazy" decoding="async" />
          </picture>
          <span className="visita-pino" aria-hidden="true">
            <img src="/img/gb-branco.svg" alt="" width="610" height="611" />
          </span>
          <span className="visita-abrir">Abrir no Google Maps</span>
          <span className="visita-credito">Mapa: Google</span>
        </a>

        <div className="visita-dados">
          <ul className="visita-lista">
            <li className="revela">
              <IconePino width="20" height="20" />
              <span>
                <strong>{config.endereco}</strong>
                <br />
                {config.bairro}, {config.cidade} · CEP {config.cep}
              </span>
            </li>
            <li className="revela">
              <IconeRelogio width="20" height="20" />
              <span>
                {config.horarios.map((h) => (
                  <span key={h.dias} className="visita-hora">
                    {h.dias} <strong>{h.horas}</strong>
                  </span>
                ))}
              </span>
            </li>
          </ul>

          <div className="visita-nota revela">
            <span className="visita-estrelas" aria-hidden="true">
              {[0, 1, 2, 3, 4].map((i) => (
                <IconeEstrela key={i} width="15" height="15" />
              ))}
            </span>
            <span>
              <strong>{config.nota.valor}</strong> no Google · {config.nota.avaliacoes} avaliações
            </span>
          </div>
          <div className="visita-depoimentos">
            {DEPOIMENTOS.map((d) => (
              <blockquote key={d.autora} className="revela">
                <p>{d.texto}</p>
                <cite>{d.autora}, no Google</cite>
              </blockquote>
            ))}
          </div>

          <div className="visita-acoes revela">
            <a className="botao botao-cheio" href={config.rota} target="_blank" rel="noopener">
              <IconePino width="19" height="19" />
              Traçar rota até a loja
            </a>
            <a className="botao botao-linha" href={linkWhatsApp(mensagemVisita())} target="_blank" rel="noopener">
              <IconeWhats width="19" height="19" />
              {telefone()}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
