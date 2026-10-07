"""Exporta o monograma GB vetorizado em arquivos prontos para uso.

Le logo/trabalho/monograma-path.txt (contorno em curvas, coordenadas do print 809x790) e grava
em giseleacessorios/logo/:
  monograma-gb.svg / .png         branco sobre o salmao da marca (como o print original)
  monograma-gb-branco.svg / .png  branco, fundo transparente
  monograma-gb-salmao.svg / .png  salmao, fundo transparente
  monograma-gb-rose.svg / .png    rose (cor da placa da loja), fundo transparente
e os icones do site em site/public/img (icone-32/180/512.png e icone.svg).

PNG com 2048 px no lado maior, desenhado a 4x e reduzido (borda lisa).
Rodar de dentro de site/:  python scripts/logo/exportar_logo.py
"""
import re
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

SITE = Path(__file__).resolve().parents[2]
RAIZ = SITE.parent
TRAB = RAIZ / "logo" / "trabalho"
SAIDA = RAIZ / "logo"
ICONES = SITE / "public" / "img"
ICONES.mkdir(parents=True, exist_ok=True)

SALMAO = "#ffa398"   # medido no print da logo (255, 163, 152)
ROSE = "#c98a78"     # tom medio do rose da placa de metal da loja
D = (TRAB / "monograma-path.txt").read_text(encoding="utf-8")

# caixa do desenho no print (medida na vetorizacao): x 101-691, y 106-697
CX, CY = 396.0, 401.5
QUADRADO = (CX - 400, CY - 400, 800, 800)      # com respiro, igual ao print
JUSTO = (91.0, 96.0, 610.0, 611.0)              # so o desenho, com 10 de folga


def poligonos(d, passos=32):
    toks = re.findall(r"[MLCZ]|-?\d+(?:\.\d+)?", d)
    polis, atual, i = [], None, 0
    while i < len(toks):
        t = toks[i]
        if t == "M":
            atual = np.array([float(toks[i + 1]), float(toks[i + 2])])
            polis.append([atual]); i += 3
        elif t == "L":
            atual = np.array([float(toks[i + 1]), float(toks[i + 2])])
            polis[-1].append(atual); i += 3
        elif t == "C":
            p1 = np.array([float(toks[i + 1]), float(toks[i + 2])])
            p2 = np.array([float(toks[i + 3]), float(toks[i + 4])])
            p3 = np.array([float(toks[i + 5]), float(toks[i + 6])])
            for k in range(1, passos + 1):
                u = k / passos
                polis[-1].append((1 - u) ** 3 * atual + 3 * (1 - u) ** 2 * u * p1 + 3 * (1 - u) * u ** 2 * p2 + u ** 3 * p3)
            atual = p3; i += 7
        else:
            i += 1
    return polis


POLIS = poligonos(D)


def mascara(caixa, lado):
    """Mascara anti-serrilhada do monograma dentro da caixa (x, y, w, h), no lado pedido."""
    x0, y0, w, h = caixa
    esc = lado / max(w, h)
    W, H = round(w * esc), round(h * esc)
    K = 4
    acc = np.zeros((H * K, W * K), bool)
    for poli in POLIS:
        pts = [((p[0] - x0) * esc * K, (p[1] - y0) * esc * K) for p in poli]
        m = Image.new("1", (W * K, H * K), 0)
        ImageDraw.Draw(m).polygon(pts, fill=1)
        acc ^= np.asarray(m, bool)
    img = Image.fromarray((acc * 255).astype(np.uint8)).resize((W, H), Image.LANCZOS)
    return img


def svg(caixa, cor, fundo=None, titulo="Gisele Beatriz Acessórios"):
    x0, y0, w, h = caixa
    rect = f'<rect x="{x0:g}" y="{y0:g}" width="{w:g}" height="{h:g}" fill="{fundo}"/>' if fundo else ""
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x0:g} {y0:g} {w:g} {h:g}" role="img">'
            f"<title>{titulo}</title>{rect}"
            f'<path fill="{cor}" fill-rule="evenodd" d="{D}"/></svg>\n')


def png(caixa, cor, fundo, lado, destino):
    m = mascara(caixa, lado)
    rgb = tuple(int(cor[i:i + 2], 16) for i in (1, 3, 5))
    camada = Image.new("RGBA", m.size, rgb + (0,))
    camada.putalpha(m)
    if fundo:
        f = tuple(int(fundo[i:i + 2], 16) for i in (1, 3, 5))
        base = Image.new("RGBA", m.size, f + (255,))
        base.alpha_composite(camada)
        camada = base
    camada.save(destino, optimize=True)


VERSOES = [
    ("monograma-gb", QUADRADO, "#ffffff", SALMAO),
    ("monograma-gb-branco", JUSTO, "#ffffff", None),
    ("monograma-gb-salmao", JUSTO, SALMAO, None),
    ("monograma-gb-rose", JUSTO, ROSE, None),
]
for nome, caixa, cor, fundo in VERSOES:
    (SAIDA / f"{nome}.svg").write_text(svg(caixa, cor, fundo), encoding="utf-8")
    png(caixa, cor, fundo, 2048, SAIDA / f"{nome}.png")
    print("ok", nome)

# icones do site: quadrado salmao com o monograma branco ocupando ~78%
ICONE_CAIXA = (CX - 380, CY - 380, 760, 760)
for lado in (32, 180, 512):
    png(ICONE_CAIXA, "#ffffff", SALMAO, lado, ICONES / f"icone-{lado}.png")
(ICONES / "icone.svg").write_text(svg(ICONE_CAIXA, "#ffffff", SALMAO), encoding="utf-8")
print("icones ok")

# versoes leves para o site (coordenadas inteiras: a diferenca nao aparece no tamanho de uso)
def arredonda(d):
    return re.sub(r"-?\d+\.\d+", lambda m: str(round(float(m.group()))), d)


D_LEVE = arredonda(D)
for nome, cor in (("gb-branco", "#ffffff"), ("gb-salmao", SALMAO), ("gb-rose", ROSE), ("gb-tinta", "#3a2722")):
    x0, y0, w, h = JUSTO
    (ICONES / f"{nome}.svg").write_text(
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x0:g} {y0:g} {w:g} {h:g}">'
        f'<path fill="{cor}" fill-rule="evenodd" d="{D_LEVE}"/></svg>\n', encoding="utf-8")
print("svgs leves ok:", len(D_LEVE), "caracteres")
