import { IconeWhats } from './Icones.jsx'

/* Barra do topo: aparece depois que a abertura fica para trás (html.passou). */
export default function Topo({ linkContato }) {
  return (
    <div className="topo">
      <a className="topo-marca" href="#inicio" aria-label="Gisele Beatriz Acessórios, voltar ao início">
        <img src="/img/gb-salmao.svg" alt="" width="610" height="611" />
        <span>
          Gisele Beatriz
          <small>Acessórios</small>
        </span>
      </a>
      <nav className="topo-nav" aria-label="Seções">
        <a href="#loja">A loja</a>
        <a href="#catalogo">Catálogo</a>
        <a href="#visite">Visite</a>
      </nav>
      <a className="topo-whats" href={linkContato} target="_blank" rel="noopener" aria-label="Chamar a loja no WhatsApp">
        <IconeWhats width="18" height="18" />
        <span>WhatsApp</span>
      </a>
    </div>
  )
}
