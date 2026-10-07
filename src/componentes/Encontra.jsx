/* O que tem na loja: os destaques do Instagram (Brincos, Colares, Pulseiras...) mais os
   óculos, que chegaram em dezembro de 2025 (post da loja). Duas faixas correndo em
   sentidos opostos; o leitor de tela recebe a lista uma vez só. */

const LINHA_1 = ['Brincos', 'Colares', 'Pulseiras', 'Anéis', 'Conjuntos', 'Trios e duplas', 'Braceletes', 'Prata 925']
const LINHA_2 = ['Piercings', 'Tornozeleiras', 'Berloques', 'Relógios', 'Óculos', 'Infantis', 'Masculinos']

function Faixa({ itens, sentido }) {
  const volta = [...itens, ...itens]
  return (
    <div className={`encontra-faixa encontra-${sentido}`} aria-hidden="true">
      <div className="encontra-trilho">
        {volta.map((t, i) => (
          <span key={i} className="encontra-item">
            {t}
            <i className="encontra-sep" />
          </span>
        ))}
      </div>
    </div>
  )
}

export default function Encontra() {
  return (
    <section className="encontra" aria-labelledby="encontra-titulo">
      <p id="encontra-titulo" className="sobretitulo encontra-titulo revela">
        Na loja você encontra
      </p>
      <Faixa itens={LINHA_1} sentido="ida" />
      <Faixa itens={LINHA_2} sentido="volta" />
      <ul className="so-leitor">
        {[...LINHA_1, ...LINHA_2].map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </section>
  )
}
