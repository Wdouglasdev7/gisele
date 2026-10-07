"""Prepara as imagens do site da Gisele Beatriz Acessórios.

- Hero (hero.png) e foto da loja: AVIF + WebP em várias larguras, sem corte e sem mexer na cor.
- Globo de luz da hero escurecido (mesma conta do véu da abertura), com fundo transparente:
  fica por cima da escrita do monograma, para ela passar por trás do globo.
- Fotos das peças (as que aparecem em src/dados/produtos.js): WebP em 360/540/800/1080.
- Prévia do link (compartilhar.jpg, 1200x630).
No fim grava src/dados/imagens.json com o tamanho de cada foto (o site reserva o espaço certo).

Rodar de dentro de site/:  python scripts/preparar-imagens.py
"""
import json
import re
from pathlib import Path

import numpy as np
from PIL import Image

SITE = Path(__file__).resolve().parent.parent
RAIZ = SITE.parent
IG = RAIZ / "instagram" / "fotos"
SAIDA = SITE / "public" / "img"
(SAIDA / "p").mkdir(parents=True, exist_ok=True)

HERO = RAIZ / "hero.png"
LOJA = RAIZ / "18dfb79f-d612-481a-8b62-ebf9b5bb949d.png"
MASCARA_LAMPADA = RAIZ / "logo" / "trabalho" / "lampada-mascara.png"

# véu da abertura: tem que ser igual ao do CSS (.abertura-veu)
VEU_COR = (18, 9, 5)
VEU_ALFA = 0.62


def larguras_de(w, alvo):
    out = [x for x in alvo if x < w]
    out.append(w if w <= alvo[-1] else alvo[-1])
    return sorted(set(out))


def grava(im, nome, alvo, avif_q=None, webp_q=82, pasta=SAIDA):
    w, h = im.size
    feitas = []
    for lw in larguras_de(w, alvo):
        lh = round(h * lw / w)
        c = im if lw == w else im.resize((lw, lh), Image.LANCZOS)
        c.save(pasta / f"{nome}-{lw}.webp", "WEBP", quality=webp_q, method=6)
        if avif_q:
            c.save(pasta / f"{nome}-{lw}.avif", "AVIF", quality=avif_q, speed=4)
        feitas.append(lw)
    return {"w": w, "h": h, "larguras": feitas}


def ambiente():
    """Fundo da hero fora da foto: a própria foto, bem pequena e desfocada (o navegador amplia
    liso). Só aparece nas faixas em volta da foto; a foto em si fica inteira por cima."""
    from PIL import ImageFilter
    im = Image.open(HERO).convert("RGB").resize((96, 54), Image.LANCZOS).filter(ImageFilter.GaussianBlur(3.5))
    im.save(SAIDA / "heroi-ambiente.webp", "WEBP", quality=70)


def main():
    dados = {"_fotos": {}}

    # ---------- hero ----------
    hero = Image.open(HERO).convert("RGB")
    dados["heroi"] = grava(hero, "heroi", (640, 960, 1280, 1672), avif_q=80, webp_q=84)

    # ---------- globo da hero, escurecido como o véu ----------
    m = np.asarray(Image.open(MASCARA_LAMPADA).convert("L"))
    ys, xs = np.nonzero(m > 2)
    x0, x1, y0, y1 = xs.min() - 2, xs.max() + 3, ys.min(), ys.max() + 3
    f = np.asarray(hero, np.float32)
    escura = f * (1 - VEU_ALFA) + np.array(VEU_COR, np.float32) * VEU_ALFA
    rgba = np.dstack([escura, m]).astype(np.uint8)[y0:y1, x0:x1]
    Image.fromarray(rgba, "RGBA").save(SAIDA / "lampada-escura.webp", "WEBP", quality=88, alpha_quality=90, method=6)
    dados["lampada"] = {"x": int(x0), "y": int(y0), "w": int(x1 - x0), "h": int(y1 - y0)}

    # ---------- loja por dentro ----------
    loja = Image.open(LOJA).convert("RGB")
    dados["loja"] = grava(loja, "loja", (640, 960, 1448), avif_q=72, webp_q=82)

    # ---------- peças ----------
    txt = (SITE / "src" / "dados" / "produtos.js").read_text(encoding="utf-8")
    fotos = []
    for bloco in re.findall(r"fotos:\s*\[([^\]]*)\]", txt):
        for nome in re.findall(r"'([^']+)'", bloco):
            if nome not in fotos:
                fotos.append(nome)
    for nome in fotos:
        im = Image.open(IG / f"{nome}.jpg").convert("RGB")
        dados["_fotos"][nome] = grava(im, nome, (360, 540, 800, 1080), webp_q=80, pasta=SAIDA / "p")
    print(f"{len(fotos)} fotos de peças")

    ambiente()

    # ---------- prévia do link ----------
    alvo_w, alvo_h = 1200, 630
    c = hero.resize((alvo_w, round(hero.height * alvo_w / hero.width)), Image.LANCZOS)
    topo = (c.height - alvo_h) // 3
    c.crop((0, topo, alvo_w, topo + alvo_h)).save(SAIDA / "compartilhar.jpg", quality=84, optimize=True)

    destino = SITE / "src" / "dados" / "imagens.json"
    destino.write_text(json.dumps(dados, separators=(",", ":")), encoding="utf-8")
    total = sum(p.stat().st_size for p in SAIDA.rglob("*") if p.is_file())
    print(f"ok: {total / 1024:.0f} KB em public/img")
    for nome in ("heroi", "loja"):
        for lw in dados[nome]["larguras"]:
            a = (SAIDA / f"{nome}-{lw}.avif").stat().st_size / 1024
            b = (SAIDA / f"{nome}-{lw}.webp").stat().st_size / 1024
            print(f"  {nome}-{lw}: avif {a:.0f} KB, webp {b:.0f} KB")


if __name__ == "__main__":
    main()
