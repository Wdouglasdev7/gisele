import { useCallback, useEffect, useRef, useState } from 'react'
import Topo from './componentes/Topo.jsx'
import Abertura from './componentes/Abertura.jsx'
import Loja from './componentes/Loja.jsx'
import Encontra from './componentes/Encontra.jsx'
import Catalogo from './componentes/Catalogo.jsx'
import Visita from './componentes/Visita.jsx'
import Rodape from './componentes/Rodape.jsx'
import Ficha from './componentes/Ficha.jsx'
import { IconeWhats } from './componentes/Icones.jsx'
import { achaProduto, linkWhatsApp, mensagemContato } from './pedido.js'
import { escanear } from './rolagem.js'

const LINK_CONTATO = linkWhatsApp(mensagemContato())

// #p/id abre a peça; #p/id/3 abre na foto 3 (modelo escolhido nas peças de prata e nas cores)
function lerHash() {
  const h = decodeURIComponent(window.location.hash.slice(1))
  const m = h.match(/^p\/([^/]+)(?:\/(\d+))?$/)
  if (!m || !achaProduto(m[1])) return null
  return { id: m[1], foto: m[2] ? Math.max(0, parseInt(m[2], 10) - 1) : 0 }
}

export default function App() {
  const [ficha, setFicha] = useState(null)
  const empilhou = useRef(false)

  useEffect(() => {
    document.documentElement.classList.add('pronto')
    escanear()
  }, [])

  useEffect(() => {
    const ler = () => {
      const f = lerHash()
      if (!f) empilhou.current = false
      setFicha(f)
    }
    ler()
    window.addEventListener('hashchange', ler)
    return () => window.removeEventListener('hashchange', ler)
  }, [])

  const abrir = useCallback((id) => {
    const alvo = `#p/${id}`
    if (window.location.hash.startsWith('#p/')) {
      window.history.replaceState(null, '', alvo)
    } else {
      window.history.pushState(null, '', alvo)
      empilhou.current = true
    }
    setFicha({ id, foto: 0 })
  }, [])

  // fechar volta no histórico quando a ficha foi aberta aqui (o botão voltar do celular fecha
  // a ficha em vez de sair do site); quem chegou por link direto só perde o #p/ da barra
  const fechar = useCallback(() => {
    if (empilhou.current) {
      empilhou.current = false
      window.history.back()
    } else {
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
      setFicha(null)
    }
  }, [])

  const trocouFoto = useCallback((i) => {
    const h = window.location.hash.match(/^#p\/([^/]+)/)
    if (h) window.history.replaceState(null, '', `#p/${h[1]}/${i + 1}`)
  }, [])

  return (
    <>
      <a className="pular" href="#catalogo">
        Pular para o catálogo
      </a>
      <Topo linkContato={LINK_CONTATO} />
      <main>
        <div className="duo">
          <Abertura />
          <Loja />
        </div>
        <Encontra />
        <Catalogo onAbrir={abrir} />
        <Visita />
      </main>
      <Rodape linkContato={LINK_CONTATO} />
      <a className="flutuante" href={LINK_CONTATO} target="_blank" rel="noopener" aria-label="Chamar a loja no WhatsApp">
        <IconeWhats width="28" height="28" />
      </a>
      <Ficha estado={ficha} onFechar={fechar} onFoto={trocouFoto} />
    </>
  )
}
