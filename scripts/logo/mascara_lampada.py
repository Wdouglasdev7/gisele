"""Máscara da luminária que fica na frente da placa (haste, cúpula e globo), em coordenadas da
foto hero.png (1672x941). Medida à mão num recorte ampliado 3x com grade.
Saída: logo/trabalho/lampada-mascara.png (usada por scripts/preparar-imagens.py).
Rodar de dentro de site/:  python scripts/logo/mascara_lampada.py
"""
from pathlib import Path

from PIL import Image, ImageDraw

RAIZ = Path(__file__).resolve().parents[3]
W, H, K = 1672, 941, 4  # desenha a 4x e reduz: borda lisa


def P(pts):
    return [(x * K, y * K) for x, y in pts]


m = Image.new("L", (W * K, H * K), 0)
d = ImageDraw.Draw(m)
d.polygon(P([(465.5, 0), (480.5, 0), (480.5, 138), (465.5, 138)]), fill=255)              # haste
d.rectangle((462 * K, 131 * K, 484 * K, 139 * K), fill=255)                                 # anel
d.polygon(P([(462, 137), (484, 137), (500, 140), (515, 146), (528, 153), (538, 160), (545, 168),
             (407, 168), (413, 160), (424, 153), (437, 146), (451, 140)]), fill=255)         # cúpula
cx, cy, r = 476, 233, 92.5                                                                   # globo
d.ellipse(((cx - r) * K, (cy - r) * K, (cx + r) * K, (cy + r) * K), fill=255)
m.resize((W, H), Image.LANCZOS).save(RAIZ / "logo" / "trabalho" / "lampada-mascara.png")
print("ok")
