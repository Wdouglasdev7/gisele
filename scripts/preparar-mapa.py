"""Recorta as capturas do mapa do Google (giseleacessorios/mapa/, feitas com
scripts/captura-mapa.html) para a seção "Venha conhecer a loja".

A captura tem 1800x1500 e o embed centra o mapa na loja: o ponto (900, 750) é a loja.
Recorte simétrico em volta dele (sai o cartão do Google do canto e os botões do rodapé).
O mapa vira duotom nas cores do site (espresso -> creme); o satélite fica com a cor real.

Rodar de dentro de site/:  python scripts/preparar-mapa.py
"""
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

SITE = Path(__file__).resolve().parent.parent
FONTE = SITE.parent / "mapa"
SAIDA = SITE / "public" / "img"
CX, CY = 900, 750
ESCURO = np.array([74, 47, 40], np.float32)   # espresso
CLARO = np.array([251, 243, 238], np.float32)  # creme


def sem_pino(im):
    """Apaga o pino vermelho do Google (o site põe o pino GB no lugar). O nome da loja
    escrito no mapa fica. O pino tem a ponta em (900, 750) e uns 26x36 px."""
    a = np.asarray(im).copy()
    x0, x1, y0, y1 = 878, 922, 706, 758
    r = a[y0:y1, x0:x1].astype(int)
    vermelho = (r[..., 0] > 150) & (r[..., 1] < 120) & (r[..., 2] < 110) & (r[..., 0] - r[..., 1] > 70)
    m = np.zeros(a.shape[:2], np.uint8)
    m[y0:y1, x0:x1] = vermelho.astype(np.uint8) * 255
    # o miolo escuro do pino fica dentro do vermelho: fecha e engorda a mascara
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
    m = cv2.dilate(m, np.ones((5, 5), np.uint8))
    return Image.fromarray(cv2.inpaint(a, m, 7, cv2.INPAINT_TELEA))


def recorta(im, w, h):
    return im.crop((CX - w // 2, CY - h // 2, CX + w // 2, CY + h // 2))


def duotom(im):
    a = np.asarray(im.convert("L"), np.float32) / 255
    a = np.clip((a - 0.35) / 0.65, 0, 1) ** 0.85   # o mapa do Google é claro: abre o contraste
    rgb = ESCURO * (1 - a[..., None]) + CLARO * a[..., None]
    return Image.fromarray(rgb.astype(np.uint8))


mapa = sem_pino(Image.open(FONTE / "captura-mapa-z17.png").convert("RGB"))
sat = sem_pino(Image.open(FONTE / "captura-satelite-z17.png").convert("RGB"))
for sufixo, (w, h) in (("1600", (1600, 780)), ("m", (900, 1376))):
    duotom(recorta(mapa, w, h)).save(SAIDA / f"mapa-{sufixo}.webp", "WEBP", quality=72, method=6)
    recorta(sat, w, h).save(SAIDA / f"satelite-{sufixo}.webp", "WEBP", quality=46, method=6)
for f in sorted(SAIDA.glob("[ms]a*-*.webp")):
    print(f.name, f"{f.stat().st_size / 1024:.0f} KB")
