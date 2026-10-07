"""Esqueleto do monograma: linha central de cada traco, quebrada em ramos entre pontas e
cruzamentos. Desenha cada ramo com cor e numero para eu escolher a ordem da escrita."""
import json, sys
from pathlib import Path

import numpy as np
import cv2
from PIL import Image, ImageDraw, ImageFont
from skimage.morphology import skeletonize

PASTA = Path(sys.argv[1])
ESC = 2  # trabalha a 2x do print (a mascara salva e 4x)

m4 = np.asarray(Image.open(PASTA / "mascara-4x.png").convert("L")) > 127
m = cv2.resize(m4.astype(np.uint8) * 255, (m4.shape[1] // 2, m4.shape[0] // 2), interpolation=cv2.INTER_AREA) > 127
m = cv2.morphologyEx(m.astype(np.uint8), cv2.MORPH_CLOSE, np.ones((3, 3), np.uint8)) > 0
dt = cv2.distanceTransform(m.astype(np.uint8), cv2.DIST_L2, 5)
esq = skeletonize(m)
H, W = esq.shape

viz = [(-1, -1), (-1, 0), (-1, 1), (0, -1), (0, 1), (1, -1), (1, 0), (1, 1)]
pix = set(zip(*np.nonzero(esq)))


def vizinhos(p):
    y, x = p
    return [(y + a, x + b) for a, b in viz if (y + a, x + b) in pix]


grau = {p: len(vizinhos(p)) for p in pix}
nos = {p for p, g in grau.items() if g != 2}
# junta pixels de cruzamento vizinhos num no so
grupo = {}
gid = 0
for p in nos:
    if p in grupo:
        continue
    fila = [p]
    grupo[p] = gid
    while fila:
        q = fila.pop()
        for r in vizinhos(q):
            if r in nos and r not in grupo:
                grupo[r] = gid
                fila.append(r)
    gid += 1
centro = {}
for p, g in grupo.items():
    centro.setdefault(g, []).append(p)
centro = {g: tuple(np.mean(v, axis=0)) for g, v in centro.items()}

ramos = []
visto = set()
for p in nos:
    for r in vizinhos(p):
        if r in nos:
            continue
        chave = (p, r)
        if chave in visto:
            continue
        cadeia = [p, r]
        ant, atual = p, r
        while atual not in nos:
            prox = [q for q in vizinhos(atual) if q != ant and q not in cadeia[-3:]]
            if not prox:
                break
            ant, atual = atual, prox[0]
            cadeia.append(atual)
        visto.add((cadeia[0], cadeia[1]))
        if len(cadeia) > 2:
            visto.add((cadeia[-1], cadeia[-2]))
        ramos.append({"de": grupo.get(cadeia[0]), "para": grupo.get(cadeia[-1]), "pts": cadeia})

# tira duplicados (mesma cadeia percorrida pelos dois lados)
unicos = []
assin = set()
for r in ramos:
    k = tuple(sorted([r["pts"][0], r["pts"][-1]])) + (len(r["pts"]),)
    if k in assin:
        continue
    assin.add(k)
    unicos.append(r)
ramos = [r for r in unicos if len(r["pts"]) >= 4]
print("nos:", len(centro), "ramos:", len(ramos))

# desenho de conferencia
fundo = Image.fromarray(np.where(m, 70, 20).astype(np.uint8)).convert("RGB")
dr = ImageDraw.Draw(fundo)
rng = np.random.default_rng(3)
fonte = ImageFont.load_default(size=22)
saida = []
for i, r in enumerate(ramos):
    cor = tuple(int(c) for c in rng.integers(90, 255, 3))
    xy = [(x, y) for y, x in r["pts"]]
    dr.line(xy, fill=cor, width=5)
    meio = xy[len(xy) // 2]
    dr.text((meio[0] + 6, meio[1] - 10), str(i), fill=(255, 255, 0), font=fonte, stroke_width=2, stroke_fill=(0, 0, 0))
    esp = [float(dt[y, x]) for y, x in r["pts"]]
    saida.append({"id": i, "de": r["de"], "para": r["para"], "n": len(r["pts"]),
                  "pts": [[x / ESC, y / ESC] for y, x in r["pts"]], "meia_espessura": [e / ESC for e in esp]})
for g, (y, x) in centro.items():
    dr.ellipse((x - 7, y - 7, x + 7, y + 7), outline=(255, 255, 255), width=2)
    dr.text((x + 8, y + 6), f"n{g}", fill=(150, 255, 150), font=ImageFont.load_default(size=16))
fundo.save(PASTA / "esqueleto.png")
json.dump({"ramos": saida, "nos": {str(g): [c[1] / ESC, c[0] / ESC] for g, c in centro.items()}},
          open(PASTA / "esqueleto.json", "w"))
