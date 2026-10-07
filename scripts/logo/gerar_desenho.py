"""Gera os dados da escrita do monograma sobre a placa da foto da hero.

Entrada: esqueleto.json (ramos da linha central, coordenadas do print 809x790), o contorno
vetorizado e a homografia print -> foto. Saida (JSON para o site):
  monograma: contorno ja na coordenada da foto (1672x941)
  pedacos:   trechos curtos da linha central, cada um com a largura do traco naquele ponto,
             o instante em que comeca e a duracao (a mascara revela o contorno por eles)
  canetas:   o caminho inteiro de cada traco e o tempo, para o brilho da ponta da caneta
"""
import json, re, sys, math
from pathlib import Path

import numpy as np
from scipy.signal import savgol_filter

PASTA = Path(sys.argv[1])
SAIDA = Path(sys.argv[2])

esq = json.load(open(PASTA / "esqueleto.json"))
ramos = {r["id"]: r for r in esq["ramos"]}
Hm = np.array(json.load(open(PASTA / "placa.json"))["homografia"])


def aplica(p):
    p = np.asarray(p, np.float64)
    q = np.c_[p, np.ones(len(p))] @ Hm.T
    return q[:, :2] / q[:, 2:3]


# ordem da escrita: (ramo, sentido). +1 = como o ramo foi tracado, -1 = ao contrario
TRACOS = [
    ("G", [(9, -1)]),
    ("haste", [(3, +1)]),
    ("B-cima", [(11, +1), (8, +1)]),
    ("B-baixo", [(2, +1)]),
    ("laco", [(7, +1), (0, +1), (10, +1), (12, +1)]),
    ("voluta", [(13, +1), (6, +1), (5, -1), (4, +1), (5, +1), (1, +1)]),
]
VELOCIDADE = 1500.0   # px do print por segundo
INICIO = 0.35         # s antes do primeiro traco
PAUSA = 0.07          # caneta levantando entre tracos
MIN_DUR = 0.22
PEDACO = 22.0         # comprimento de cada trecho da mascara (px do print)
MARGEM = 3.0          # sobra de largura do pincel (px do print)


def easing(u):
    # sai um pouco devagar e chega um pouco devagar (e escrita, nao mola):
    # 65% velocidade constante + 35% smoothstep
    return u * u * (3 - 2 * u) * 0.35 + u * 0.65


def inversa(s):
    lo, hi = 0.0, 1.0
    for _ in range(40):
        mid = (lo + hi) / 2
        if easing(mid) < s:
            lo = mid
        else:
            hi = mid
    return (lo + hi) / 2


def junta(partes):
    pts, esp = [], []
    for rid, sentido in partes:
        r = ramos[rid]
        p = r["pts"] if sentido > 0 else r["pts"][::-1]
        e = r["meia_espessura"] if sentido > 0 else r["meia_espessura"][::-1]
        if pts:
            p, e = p[1:], e[1:]
        pts += p
        esp += e
    return np.array(pts, np.float64), np.array(esp, np.float64)


def reamostra(p, passo=1.5):
    seg = np.linalg.norm(np.diff(p, axis=0), axis=1)
    s = np.r_[0, np.cumsum(seg)]
    n = max(2, int(s[-1] / passo))
    alvo = np.linspace(0, s[-1], n)
    return np.c_[np.interp(alvo, s, p[:, 0]), np.interp(alvo, s, p[:, 1])], alvo


def fmt(v):
    # coordenada da foto inteira: na tela a foto nunca passa de ~1,15x, o erro fica abaixo de 1 px
    return str(int(round(v)))


def d_de(p, passo=4.0):
    # menos pontos: um a cada ~4 px (sempre com o primeiro e o ultimo), inteiros
    seg = np.linalg.norm(np.diff(p, axis=0), axis=1)
    s = np.r_[0, np.cumsum(seg)]
    marcas = [0]
    for i in range(1, len(p) - 1):
        if s[i] - s[marcas[-1]] >= passo:
            marcas.append(i)
    marcas.append(len(p) - 1)
    q = p[marcas]
    return "M" + "L".join(f"{int(round(x))} {int(round(y))}" for x, y in q)


saida = {"pedacos": [], "canetas": []}
t = INICIO
for nome, partes in TRACOS:
    p, esp = junta(partes)
    # suaviza o serrilhado do esqueleto de pixel sem mexer nas pontas
    if len(p) > 15:
        jan = min(len(p) // 2 * 2 - 1, 21)
        ps = np.c_[savgol_filter(p[:, 0], jan, 3), savgol_filter(p[:, 1], jan, 3)]
        ps[:3], ps[-3:] = p[:3], p[-3:]
        p = ps
    esp_s = np.r_[0, np.cumsum(np.linalg.norm(np.diff(p, axis=0), axis=1))]
    p, s = reamostra(p)
    meia = np.interp(s, esp_s, esp)
    L = s[-1]
    dur = max(MIN_DUR, L / VELOCIDADE)
    # largura do pincel por trecho: a maior meia-espessura num raio de 1 pedaco
    n_ped = max(1, int(round(L / PEDACO)))
    limites = np.linspace(0, L, n_ped + 1)
    foto = aplica(p)
    escala = np.mean([np.linalg.norm(Hm[:2, 0]), np.linalg.norm(Hm[:2, 1])])
    for k in range(n_ped):
        a, b = limites[k], limites[k + 1]
        dentro = (s >= a - 1.0) & (s <= b + 1.5)  # encosta um pouco no proximo (sem fresta)
        idx = np.nonzero(dentro)[0]
        perto = (s >= a - PEDACO * 0.6) & (s <= b + PEDACO * 0.6)
        larg = (2 * np.percentile(meia[perto], 90) + MARGEM) * escala
        t0 = t + dur * inversa(a / L)
        t1 = t + dur * inversa(b / L)
        saida["pedacos"].append({"d": d_de(foto[idx]), "w": round(float(larg), 1),
                                 "b": round(t0, 3), "dur": round(max(0.01, t1 - t0), 3), "traco": nome})
    # caneta: mesmo caminho, tempo pela mesma curva (keyTimes x keyPoints)
    kt, kp = [], []
    for j in range(21):
        u = j / 20
        kt.append(round(u, 4))
        kp.append(round(easing(u), 4))
    saida["canetas"].append({"d": d_de(foto, 6.0), "b": round(t, 3), "dur": round(dur, 3),
                             "keyTimes": ";".join(map(str, kt)), "keyPoints": ";".join(map(str, kp)), "traco": nome})
    print(f"{nome:8s} comp {L:6.0f}  {dur:.2f}s  inicio {t:.2f}s  pedacos {n_ped}")
    t += dur + PAUSA
saida["fim"] = round(t - PAUSA, 3)
print("fim da escrita:", saida["fim"], "s  pedacos:", len(saida["pedacos"]))

# contorno do monograma na coordenada da foto (pontos de controle passam pela homografia)
d = (PASTA / "monograma-path.txt").read_text(encoding="utf-8")
toks = re.findall(r"[MLCZ]|-?\d+(?:\.\d+)?", d)
out = []
i = 0
while i < len(toks):
    tk = toks[i]
    if tk in ("M", "L"):
        x, y = aplica([[float(toks[i + 1]), float(toks[i + 2])]])[0]
        out.append(f"{tk}{fmt(x)} {fmt(y)}"); i += 3
    elif tk == "C":
        q = aplica([[float(toks[i + 1]), float(toks[i + 2])], [float(toks[i + 3]), float(toks[i + 4])],
                    [float(toks[i + 5]), float(toks[i + 6])]])
        out.append("C" + " ".join(f"{fmt(x)} {fmt(y)}" for x, y in q)); i += 7
    else:
        out.append("Z"); i += 1
saida["monograma"] = "".join(out)
saida["foto"] = {"w": 1672, "h": 941}
json.dump(saida, open(SAIDA, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print("gravado", SAIDA, f"{SAIDA.stat().st_size / 1024:.1f} KB")
