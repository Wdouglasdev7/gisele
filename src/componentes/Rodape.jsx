import { config } from '../dados/config.js'
import { telefone } from '../pedido.js'
import { IconeInstagram, IconeWhats } from './Icones.jsx'

export default function Rodape({ linkContato }) {
  return (
    <footer className="rodape">
      <div className="rodape-grade">
        <div className="rodape-marca">
          <img src="/img/gb-salmao.svg" alt="" width="610" height="611" loading="lazy" />
          <p>
            Gisele Beatriz
            <small>Acessórios</small>
          </p>
        </div>
        <div className="rodape-bloco">
          <p className="rodape-titulo">Loja</p>
          <p>
            {config.endereco}
            <br />
            {config.bairro}, {config.cidade}
            <br />
            CEP {config.cep}
          </p>
        </div>
        <div className="rodape-bloco">
          <p className="rodape-titulo">Horário</p>
          <p>
            {config.horarios.map((h) => (
              <span key={h.dias} className="rodape-linha">
                {h.dias}, {h.horas}
              </span>
            ))}
          </p>
        </div>
        <div className="rodape-bloco">
          <p className="rodape-titulo">Fale com a loja</p>
          <p className="rodape-links">
            <a href={linkContato} target="_blank" rel="noopener">
              <IconeWhats width="17" height="17" /> {telefone()}
            </a>
            <a href={`https://www.instagram.com/${config.instagram}/`} target="_blank" rel="noopener">
              <IconeInstagram width="17" height="17" /> @{config.instagram}
            </a>
          </p>
        </div>
      </div>
      <div className="rodape-fim">
        <p>© 2026 Gisele Beatriz Acessórios · Anápolis, GO</p>
        <a className="rodape-credito" href="https://www.instagram.com/wdougla.s/" target="_blank" rel="noopener">
          <IconeInstagram width="14" height="14" />
          feito por Wdouglas
        </a>
      </div>
    </footer>
  )
}
