# Gisele Beatriz Acessórios · site com catálogo e pedido no WhatsApp

Feito em 06/10/2026 para substituir o Google Sites da loja (prometido junto com a plaquinha).
React 19 + Vite, com pré-render: o HTML já sai com o site inteiro e o CSS embutido.

## Rodar e publicar

```
npm install
npm run dev        # desenvolvimento
npm run build      # gera dist/ (HTML pré-montado)
npm run preview    # confere o dist/ em http://localhost:4173
```

Vercel: importar o repositório, build `npm run build`, saída `dist` (já está no `vercel.json`).
Ao ter o endereço definitivo, trocar o `og:image` do `index.html` por URL absoluta
(`https://<dominio>/img/compartilhar.jpg`): WhatsApp e Facebook não leem caminho relativo.

## Onde mexer

| O quê | Arquivo |
|---|---|
| Peças do catálogo (nome, descrição, peças e preços, fotos, opções) | `src/dados/produtos.js` |
| WhatsApp, endereço, horário, nota do Google, esconder preços | `src/dados/config.js` |
| Fotos novas de peça | salvar em `giseleacessorios/instagram/fotos/<nome>.jpg`, citar o nome em `fotos` no `produtos.js` e rodar `python scripts/preparar-imagens.py` |
| Cores, fontes e espaçamentos | topo do `src/estilo.css` |
| Mapa do fim do site | capturas em `giseleacessorios/mapa/` (feitas com `scripts/captura-mapa.html`), recorte e duotom com `python scripts/preparar-mapa.py` |

Preço `null` mostra "Consultar valor". `mostrarPrecos: false` no config esconde todos os preços.
Peça com `opcoes.porFoto` (prata 925, cores): a foto que está na tela é o modelo escolhido, e ele
vai na mensagem e no link (`#p/brincos-prata-925/4` abre direto na foto 4).

## A abertura (monograma escrito sobre a placa)

A logo do print foi vetorizada (`logo/monograma-gb*.svg` e `.png` em 2048 px) e encaixada na placa de
metal da foto `hero.png` por homografia (erro médio de 2 px). O esqueleto do monograma virou 161
trechos curtos; cada um anima o próprio traço dentro de uma máscara SVG, na ordem da escrita
(G, haste, B, laço, voluta). É só CSS: começa na primeira pintura, antes do JavaScript.
O globo da luminária tem um recorte escurecido por cima, por isso a escrita passa "por trás" dele.
O React só assume a página quando a escrita termina (ou no primeiro toque/rolagem), para não disputar
o processador com a animação. Passa toda vez que o site abre, inclusive no F5 (recarregar volta
para o topo). Pulam a abertura: link direto de peça (`#p/...`) ou de seção (`#catalogo`) e
"reduzir movimento" no aparelho. A regra fica no script do `<head>` do `index.html`.

Refazer, de dentro de `site/` (precisa de `pip install potracer` para o primeiro passo):

```
python scripts/logo/vetorizar_logo.py <print da logo> ../logo/trabalho <pasta do potracer>
python scripts/logo/alinhar_placa.py ../hero.png ../logo/trabalho/monograma-path.txt ../logo/trabalho
python scripts/logo/esqueleto.py ../logo/trabalho
python scripts/logo/gerar_desenho.py ../logo/trabalho src/dados/desenho.json
python scripts/logo/exportar_logo.py
python scripts/logo/mascara_lampada.py   # recorte do globo; depois rodar preparar-imagens.py
```

Velocidade e ordem da escrita: `TRACOS` e `VELOCIDADE` em `gerar_desenho.py`. O véu escuro do CSS
(`.abertura-veu`) tem que bater com `VEU_COR`/`VEU_ALFA` do `preparar-imagens.py`.

## De onde veio cada coisa

- **Peças e preços:** 30 peças de 23 posts do @giselebeatrizacessorios, de 05/02 a 18/09/2026.
  Preço da legenda ou do valor escrito na própria foto (brincos de 24/06, cristais e minimalistas
  de 19/05, trevos de 05/02). Prata 925 sem preço publicado: "Consultar valor".
- **Textos:** o site antigo da loja (Google Sites) e a bio. "Há mais de 14 anos": bio.
  Garantia de 1 ano nas semijoias e prata 925: descrição da própria loja no Google.
- **Endereço, CEP, horário e nota 5,0 com 77 avaliações:** ficha da loja no Google (06/10/2026).
  Os dois depoimentos são avaliações públicas dessa ficha (só o primeiro nome e a inicial).
- **Categorias da faixa "Na loja você encontra":** destaques do Instagram, mais os óculos (post de
  29/12/2025).
- **Fotos da hero e da loja:** tiradas pelo Washington na loja, sem tratamento (só formato).
- **Cores:** salmão `#ffa398` medido no print da logo; rosé, madeira e rosa da loja nas fotos.
- **Instagram:** `giseleacessorios/instagram/` (posts.json, fotos e folhas de contato).

## Pendências com a loja

- Confirmar se as peças de fevereiro a junho ainda estão disponíveis e com o mesmo valor.
- Confirmar se pode usar o primeiro nome das clientes nos depoimentos.
- Confirmar se os óculos continuam à venda (estão só na faixa de categorias).
- Os 64 posts mais antigos dos 100 pedidos não foram lidos: o Instagram bloqueou a leitura sem
  login depois do 36º. Os 36 lidos cobrem de 29/12/2025 a 18/09/2026.
- Endereço (domínio) e publicação; `og:image` absoluta depois disso.
