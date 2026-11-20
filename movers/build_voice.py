"""Озвучка реплик (ElevenLabs), тайминги слов, параметры скольжения пианино → data/meta.json, build/voice.wav"""
import json, math, re, sys, wave
from pathlib import Path
import numpy as np
ROOT = Path(__file__).resolve().parent; sys.path.insert(0, str(ROOT.parent / "engine"))
import tts
SR = 44100; (ROOT / "data").mkdir(exist_ok=True); (ROOT / "build/tts").mkdir(parents=True, exist_ok=True)
NARR, VIT, GEN = "nPczCjzI2devNBz1zQrb", "TX3LPaxmHKxFdv7VOQHJ", "pNInz6obpgDQGcFmaJgB"
LINES = [  # (кто, начало, текст, голос, мат-приставки для затухания букв)
    ("narr", 0.35, "[laughs] Два грузчика. Одно пианино. Пятый этаж без лифта.", NARR, []),
    ("vit", 5.15, "[straining] Ёб твою мать, Геннадий, оно весит тонну!", VIT, ["ЕБ"]),
    ("gen", 8.10, "[shouting] Не тяни на себя, блядь, ссыкло!", GEN, ["БЛЯД"]),
    ("narr", 10.20, "[whispers] И тут Витя отпустил.", NARR, []),
    ("vit", 12.45, "[screaming] ПИЗДЕЦ!", VIT, ["ПИЗДЕЦ"]),
    ("gen", 19.95, "[furious] Ты нахуя его отпустил, дебил?!", GEN, ["НАХУЯ"]),
    ("vit", 22.75, "[deadpan] Зато играет, сука.", VIT, ["СУКА"]),
    ("narr", 25.00, "[laughs] Пианино в хлам. Зарплата тоже.", NARR, []),
]
dflt = {"speaker": "dmitri", "ls": .9, "pitch": 1.0, "range": 1.0, "fx": None, "provider": "elevenlabs", "model": "eleven_v3", "stability": 0.0, "tempo": 1.05}
DUR = 29.4; n = int(DUR * SR); voice = np.zeros(n); out = []
for who, t0, txt, vid, fade in LINES:
    a = tts.synth({"voice": txt, "voice_id": vid}, dflt, ROOT / "build/tts", False)
    i = int(t0 * SR); voice[i:i + len(a)] += a[:n - i]
    words = tts.word_times(txt, a, t0)
    sw = lambda w: any(re.sub(r"[^А-ЯЁA-Z]", "", w.upper().replace("Ё", "Е")).startswith(p) for p in fade)
    out.append(dict(who=who, start=t0, end=round(t0 + len(a) / SR, 3), text=txt, words=[[w, s, e, bool(sw(w))] for w, s, e in words]))
    print(f"  {who:4} {t0:5.2f}–{t0 + len(a) / SR:5.2f}  {txt}")
for x, y in zip(out, out[1:]):
    if y["start"] < x["end"] - .05: print("  ⚠ наложение реплик:", x["text"][:25], "→", y["text"][:25])
# ── физика скольжения пианино (те же формулы в сцене)
RISE, RUN = .6, .9; TH = math.atan2(RISE, RUN); CT, ST = math.cos(TH), math.sin(TH)
T_R = 11.85; X_V0, V_WALK = 1.0, .65
xV = X_V0 + V_WALK * T_R; stair_h = lambda x: 0 if x <= 0 else RISE * (math.floor(x / RUN) + 1)
hand = (xV + .55, stair_h(xV) + 1.0); xp0, yp0 = hand[0] + .457, hand[1] + 1.026
A_SL, D_FL, X_CRASH = 5.5, 2.5, -3.6
D1 = ((yp0 - .6) / ST) if True else 0           # скольжение по склону до пола
x1 = xp0 - CT * D1; tau1 = math.sqrt(2 * D1 / A_SL); v1 = A_SL * tau1 * CT * .9
# по полу: горизонтальная скорость v1 с торможением D_FL; крушение при x = X_CRASH
tc = tau1; dx = x1 - X_CRASH; tt = 0
for k in range(1, 4000):
    tt = k * .0005; xx = x1 - (v1 * tt - .5 * D_FL * tt * tt)
    if xx <= X_CRASH: break
t_crash = T_R + tau1 + tt
print(f"  скольжение: склон {tau1:.2f} c + пол {tt:.2f} c → крушение на {t_crash:.2f} c; пианино сходит на пол при x={x1:.2f}")
meta = dict(duration=DUR, t_r=T_R, x_v0=X_V0, v_walk=V_WALK, xp0=xp0, yp0=yp0, a_sl=A_SL, d_fl=D_FL, d1=D1, x1=x1, tau1=tau1, v1=v1, x_crash=X_CRASH, t_crash=t_crash, lines=out,
            banner_start=round(t_crash + .45, 2))
(ROOT / "data/meta.json").write_text(json.dumps(meta, ensure_ascii=False))
voice = voice / (np.abs(voice).max() + 1e-9) * .92
with wave.open(str(ROOT / "build/voice.wav"), "wb") as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((voice * 32767).astype(np.int16).tobytes())
print("✔ voice.wav; баннер с", meta["banner_start"])
