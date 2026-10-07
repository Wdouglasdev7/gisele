/* Miolo do SVG da escrita do monograma (máscara com os trechos, contorno, trilhos da caneta).
   Só o pré-render (e o modo de desenvolvimento) monta isto a partir de dados/desenho.json.
   No site publicado o navegador reaproveita o SVG que já veio no HTML (main.jsx), então os
   dados da escrita não entram no pacote de JavaScript. */

export function desenhoHTML(d) {
  const pedacos = d.pedacos
    .map(
      (p) =>
        `<path class="gb-pedaco" d="${p.d}" stroke-width="${p.w}" pathLength="1" ` +
        `style="animation-delay:${p.b}s;animation-duration:${p.dur}s"></path>`
    )
    .join('')
  const trilhos = d.canetas
    .map((c) => `<path class="abertura-trilho" d="${c.d}" data-b="${c.b}" data-dur="${c.dur}"></path>`)
    .join('')
  return (
    `<defs><mask id="gb-escrita" maskUnits="userSpaceOnUse" x="0" y="0" width="${d.foto.w}" height="${d.foto.h}">` +
    `<g fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round">${pedacos}</g></mask></defs>` +
    `<path class="abertura-monograma" d="${d.monograma}" fill-rule="evenodd" mask="url(#gb-escrita)"></path>` +
    `<g class="abertura-trilhos" data-fim="${d.fim}">${trilhos}</g>` +
    `<circle class="abertura-caneta" r="7" cx="-50" cy="-50"></circle>`
  )
}
