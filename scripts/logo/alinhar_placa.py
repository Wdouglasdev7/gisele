"""Encaixa o monograma vetorizado sobre a placa de metal da foto da hero.

Amostra pontos no contorno do vetor e procura a transformacao (homografia) que leva esses
pontos para cima das bordas da foto (chamfer: distancia ate a borda mais proxima). Ignora o
globo de luz, que fica na frente da placa. Grava a matriz em JSON e um print de conferencia.
"""
import json, re, sys
from pathlib import Path

import numpy as np
import cv2
from PIL import Image, ImageDraw
from scipy.optimize import minimize

HERO = Path(sys.argv[1])
PATH_TXT = Path(sys.argv[2])
SAIDA = Path(sys.argv[3])

# ---------- pontos do contorno do vetor (coordenadas do print 809x790) ----------
d = PATH_TXT.read_text(encoding="utf-8")
toks = re.findall(r"[MLCZ]|-?\d+(?:\.\d+)?", d)
pts = []
i = 0
atual = None
inicio = None
while i < len(toks):
    t = toks[i]
    if t == "M":
        atual = np.array([float(toks[i + 1]), float(toks[i + 2])]); inicio = atual; i += 3
        pts.append(atual)
    elif t == "L":
        p = np.array([float(toks[i + 1]), float(toks[i + 2])])
        for u in np.linspace(0, 1, 6)[1:]:
            pts.append(atual + (p - atual) * u)
        atual = p; i += 3
    elif t == "C":
        p1 = np.array([float(toks[i + 1]), float(toks[i + 2])])
        p2 = np.array([float(toks[i + 3]), float(toks[i + 4])])
        p3 = np.array([float(toks[i + 5]), float(toks[i + 6])])
        for u in np.linspace(0, 1, 9)[1:]:
            pts.append((1 - u) ** 3 * atual + 3 * (1 - u) ** 2 * u * p1 + 3 * (1 - u) * u ** 2 * p2 + u ** 3 * p3)
        atual = p3; i += 7
    elif t == "Z":
        i += 1
    else:
        i += 1
pts = np.array(pts, np.float64)
print("pontos no contorno:", len(pts))

# ---------- bordas da foto ----------
im = np.asarray(Image.open(HERO).convert("RGB"))
H, W = im.shape[:2]
cinza = cv2.cvtColor(im, cv2.COLOR_RGB2GRAY)
cinza = cv2.GaussianBlur(cinza, (0, 0), 1.4)
bordas = cv2.Canny(cinza, 40, 110)
gx = cv2.Sobel(cinza.astype(np.float32), cv2.CV_32F, 1, 0)
gy = cv2.Sobel(cinza.astype(np.float32), cv2.CV_32F, 0, 1)
mag = np.hypot(gx, gy) + 1e-6
# tira as bordas quase verticais (frisos da madeira): gradiente quase todo horizontal
vertical = np.abs(gy) / mag < 0.35
bordas[vertical] = 0
# globo (na frente da placa) e haste: fora da conta
GLOBO = (476, 233, 100)
yy, xx = np.mgrid[0:H, 0:W]
fora = ((xx - GLOBO[0]) ** 2 + (yy - GLOBO[1]) ** 2) < GLOBO[2] ** 2
fora |= (np.abs(xx - 470) < 14) & (yy < 150)
bordas[fora] = 0
Image.fromarray(bordas).save(SAIDA / "bordas.png")
dist = cv2.distanceTransform((bordas == 0).astype(np.uint8), cv2.DIST_L2, 5)

# so os pontos do contorno cuja normal nao e horizontal (mesmo filtro das bordas)
tang = np.gradient(pts, axis=0)
tn = np.linalg.norm(tang, axis=1) + 1e-9
normal_y = np.abs(tang[:, 0]) / tn  # normal = tangente girada: |ny| = |tx|
usa = normal_y > 0.35
P = pts[usa]
print("pontos usados:", len(P))


def homografia(v):
    a, b, c, dd, e, f, g, h = v
    return np.array([[a, b, c], [dd, e, f], [g * 1e-4, h * 1e-4, 1.0]])


def aplica(Hm, p):
    q = np.c_[p, np.ones(len(p))] @ Hm.T
    return q[:, :2] / q[:, 2:3]


def custo(v):
    q = aplica(homografia(v), P)
    x, y = q[:, 0], q[:, 1]
    dentro = (x >= 0) & (x < W - 1) & (y >= 0) & (y < H - 1)
    if dentro.sum() < 50:
        return 1e9
    xi = np.clip(x.astype(int), 0, W - 1)
    yi = np.clip(y.astype(int), 0, H - 1)
    dd = np.minimum(dist[yi, xi], 12.0)
    # ponto que cai em cima do globo nao conta (a placa esta atras dele)
    vale = dentro & ~fora[yi, xi]
    return float(np.mean(dd[vale])) + 0.02 * (len(P) - vale.sum()) / len(P)


sx, sy = 1.09, 1.036
v0 = np.array([sx, 0, 686 - 672 * sx, 0, sy, 62 - 216 * sy, 0, 0])
print("custo inicial:", custo(v0))
melhor = v0
for passo in range(3):
    r = minimize(custo, melhor, method="Powell", options={"maxiter": 20000, "xtol": 1e-4, "ftol": 1e-5})
    melhor = r.x
    print("rodada", passo, "custo", r.fun)
Hm = homografia(melhor)
print("matriz:", np.round(Hm, 6).tolist())
json.dump({"homografia": Hm.tolist(), "custo": custo(melhor)}, open(SAIDA / "placa.json", "w"))

# ---------- conferencia ----------
q = aplica(Hm, pts)
base = Image.fromarray(im).crop((0, 0, 780, 620)).convert("RGB")
dr = ImageDraw.Draw(base)
for x, y in q:
    if x < 780 and y < 620:
        dr.point((x, y), fill=(0, 255, 255))
base.save(SAIDA / "placa-encaixe.png")
q0 = aplica(homografia(v0), pts)
base0 = Image.fromarray(im).crop((0, 0, 780, 620)).convert("RGB")
dr0 = ImageDraw.Draw(base0)
for x, y in q0:
    if x < 780 and y < 620:
        dr0.point((x, y), fill=(255, 255, 0))
base0.save(SAIDA / "placa-inicial.png")
