"""Vetoriza o monograma GB (branco sobre salmao) do print da logo.

Le o PNG, separa o branco do fundo pela cor, amplia a mascara 4x, passa no potrace e grava
um SVG com o contorno em curvas. Depois rasteriza o SVG de volta e compara com a mascara
original (IoU) para conferir a fidelidade.
"""
import sys
from pathlib import Path

import numpy as np
import cv2
from PIL import Image, ImageDraw

sys.path.append(sys.argv[3])  # pasta do potracer (no fim, para nao trocar o numpy do sistema)
import potrace  # noqa: E402

ORIGEM = Path(sys.argv[1])
SAIDA = Path(sys.argv[2])
SAIDA.mkdir(parents=True, exist_ok=True)
ESCALA = 4

im = np.asarray(Image.open(ORIGEM).convert("RGB")).astype(np.float32)
FUNDO = np.array([255, 163, 152], np.float32)
# 0 no salmao, 1 no branco (usa o verde e o azul, que e onde os dois diferem)
t = ((im[..., 1] - FUNDO[1]) / (255 - FUNDO[1]) + (im[..., 2] - FUNDO[2]) / (255 - FUNDO[2])) / 2
t = np.clip(t, 0, 1)
h, w = t.shape
grande = cv2.resize(t, (w * ESCALA, h * ESCALA), interpolation=cv2.INTER_CUBIC)
grande = cv2.GaussianBlur(grande, (0, 0), 1.2)
binaria = grande > 0.5
Image.fromarray((binaria * 255).astype(np.uint8)).save(SAIDA / "mascara-4x.png")

bmp = potrace.Bitmap(~binaria)
trac = bmp.trace(turdsize=40, turnpolicy=potrace.POTRACE_TURNPOLICY_MINORITY, alphamax=1.0,
                 opticurve=True, opttolerance=0.25)


def fmt(v):
    s = f"{v / ESCALA:.2f}".rstrip("0").rstrip(".")
    return s if s != "-0" else "0"


partes = []
poligonos = []
for curva in trac.curves:
    sp = curva.start_point
    d = [f"M{fmt(sp.x)} {fmt(sp.y)}"]
    pts = [(sp.x, sp.y)]
    atual = (sp.x, sp.y)
    for seg in curva.segments:
        if seg.is_corner:
            d.append(f"L{fmt(seg.c.x)} {fmt(seg.c.y)}L{fmt(seg.end_point.x)} {fmt(seg.end_point.y)}")
            pts += [(seg.c.x, seg.c.y), (seg.end_point.x, seg.end_point.y)]
        else:
            d.append(f"C{fmt(seg.c1.x)} {fmt(seg.c1.y)} {fmt(seg.c2.x)} {fmt(seg.c2.y)} {fmt(seg.end_point.x)} {fmt(seg.end_point.y)}")
            p0 = np.array(atual)
            p1 = np.array((seg.c1.x, seg.c1.y))
            p2 = np.array((seg.c2.x, seg.c2.y))
            p3 = np.array((seg.end_point.x, seg.end_point.y))
            for k in range(1, 25):
                u = k / 24
                p = (1 - u) ** 3 * p0 + 3 * (1 - u) ** 2 * u * p1 + 3 * (1 - u) * u ** 2 * p2 + u ** 3 * p3
                pts.append(tuple(p))
        atual = (seg.end_point.x, seg.end_point.y)
    d.append("Z")
    partes.append("".join(d))
    poligonos.append(pts)

# caixa do desenho (em coordenadas do print original)
ys, xs = np.where(binaria)
x0, x1 = xs.min() / ESCALA, xs.max() / ESCALA
y0, y1 = ys.min() / ESCALA, ys.max() / ESCALA
print(f"curvas: {len(partes)}  caixa: x {x0:.1f}-{x1:.1f}  y {y0:.1f}-{y1:.1f}")

caminho = "".join(partes)
(SAIDA / "monograma-path.txt").write_text(caminho, encoding="utf-8")
svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">'
       f'<rect width="{w}" height="{h}" fill="#ffa398"/>'
       f'<path fill="#fff" fill-rule="evenodd" d="{caminho}"/></svg>')
(SAIDA / "teste-original.svg").write_text(svg, encoding="utf-8")

# rasteriza de volta (evenodd = XOR dos contornos) e compara
ras = Image.new("1", (w * ESCALA, h * ESCALA), 0)
acc = np.zeros((h * ESCALA, w * ESCALA), bool)
for pts in poligonos:
    m = Image.new("1", (w * ESCALA, h * ESCALA), 0)
    ImageDraw.Draw(m).polygon([(float(x), float(y)) for x, y in pts], fill=1)
    acc ^= np.asarray(m, bool)
inter = (acc & binaria).sum()
uniao = (acc | binaria).sum()
print(f"IoU vetor x mascara: {inter / uniao:.4f}")
diff = np.zeros((h * ESCALA, w * ESCALA, 3), np.uint8)
diff[acc & binaria] = (255, 255, 255)
diff[acc & ~binaria] = (255, 0, 0)
diff[~acc & binaria] = (0, 160, 255)
Image.fromarray(diff).resize((w, h), Image.LANCZOS).save(SAIDA / "diff.png")
