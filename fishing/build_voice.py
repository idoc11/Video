"""Озвучка «Дед и сом» (Piper + Praat, без внешних сервисов) → data/meta.json, build/voice.wav"""
import json, re, sys, wave
from pathlib import Path
import numpy as np
ROOT = Path(__file__).resolve().parent; sys.path.insert(0, str(ROOT.parent / "engine"))
import tts
SR = 44100
NARR = dict(speaker="irina", ls=.93, pitch=1.04, range=1.75, humanize=True)       # тёплый женский рассказчик
MIKH = dict(speaker="dmitri", ls=.84, pitch=.8, range=1.9, humanize=True)         # хриплый дед
VIT = dict(speaker="denis", ls=.82, pitch=1.18, range=2.0, humanize=True)         # звонкий внук
L = [  # кто, голос, текст, мат-приставки (затухают буквы), пауза перед репликой
    ("narr", NARR, "Дед Михалыч и внук Витя поехали на рыбалку. Клёва не было уже шесть часов.", [], .3),
    ("mikh", MIKH, "Тихо! Рыбу распугаешь! Ну где ты, блядь, рыба?!", ["БЛЯД"], .3),
    ("vit", VIT, "Дед, а может, она на диете?", [], .25),
    ("narr", NARR, "И тут у Вити клюнуло.", [], .3),
    ("vit", VIT, "Дед! Клюёт! Тащу!", [], .15),
    ("narr", NARR, "Он вытащил ботинок. Левый. Потом старую шину. Потом унитаз.", [], .3),
    ("mikh", MIKH, "Ты чё, мусоровоз ловишь, дебил?!", ["ДЕБИЛ"], .25),
    ("narr", NARR, "И вдруг удочку дёрнуло так, что лодка сорвалась с места.", [], .35),
    ("vit", VIT, "Дед, это кит! Или сом! Или это пиздец!", ["ПИЗДЕЦ"], .3),
    ("mikh", MIKH, "Не отпускай, внучок! Это ужин на всю неделю!", [], .2),
    ("narr", NARR, "Сом тащил лодку по озеру быстрее катера. Дед орал, а Витя снимал сторис.", [], .3),
    ("vit", VIT, "Дед, у меня сторис набрал тысячу лайков!", [], .25),
    ("mikh", MIKH, "Какие лайки?! У меня челюсть улетела, сука!", ["СУКА"], .2),
    ("narr", NARR, "Лодка пронеслась мимо пляжа. Отдыхающие синхронно уронили пиво.", [], .3),
    ("vit", VIT, "Дед, рули!", [], .2),
    ("mikh", MIKH, "Чем рулить?! Это же удочка, блядь!", ["БЛЯД"], .2),
    ("narr", NARR, "Сом то нырял, то выпрыгивал. И, кажется, ржал.", [], .3),
    ("narr", NARR, "Через час сом выдохся. Дед тоже. Они долго смотрели друг на друга.", [], .3),
    ("mikh", MIKH, "Слышь, сом. Давай по-мужски: ты нас не ешь, мы тебя не варим.", [], .3),
    ("narr", NARR, "Сом кивнул, махнул хвостом и уплыл. А на крючке остался старый кошелёк.", [], .35),
    ("vit", VIT, "Дед, там пятьсот рублей!", [], .25),
    ("mikh", MIKH, "Нахуй мне пятьсот! Я сома упустил, сука!", ["НАХУЙ", "СУКА"], .25),
    ("narr", NARR, "Мораль: не ловите то, что нельзя съесть. Или берите лодку побольше.", [], .5),
]
BANNER_AFTER, BANNER_AT, BANNER_DUR = 16, 60.0, 5.05     # баннер строго на 60-й секунде (или сразу после реплики)
cache = ROOT / "build/tts"; dflt = {"provider": "piper", "fx": None, "ns": None, "nw": None}
t, out, chunks = 0.0, [], []
t = .2; chunks.append(np.zeros(int(.2 * SR), np.float32)); banner_start = None
for i, (who, v, txt, fade, gap) in enumerate(L):
    if i == BANNER_AFTER + 1:
        banner_start = max(t + .3, BANNER_AT); g = banner_start + BANNER_DUR + .35 - t
        chunks.append(np.zeros(int(g * SR), np.float32)); t += g
    else:
        chunks.append(np.zeros(int(gap * SR), np.float32)); t += gap
    a = tts.synth({"voice": txt, **v}, dflt | v, cache, False)
    words = tts.word_times(txt, a, t)
    sw = lambda w: any(re.sub(r"[^А-ЯЁA-Z]", "", w.upper().replace("Ё", "Е")).startswith(p) for p in fade)
    out.append(dict(who=who, start=round(t, 3), end=round(t + len(a) / SR, 3), text=txt, words=[[w, s, e, bool(sw(w))] for w, s, e in words]))
    chunks.append(a); t += len(a) / SR
    print(f"  {i:2} {who:4} {out[-1]['start']:6.2f}–{out[-1]['end']:6.2f}  {txt[:60]}")
tail = 1.4; chunks.append(np.zeros(int(tail * SR), np.float32)); DUR = t + tail
voice = np.concatenate(chunks); voice = voice / (np.abs(voice).max() + 1e-9) * .92
S = [l["start"] for l in out]; E = [l["end"] for l in out]
t_d0, t_d1 = S[7] + 1.2, banner_start - 3.0
breach = []; k = t_d0 + 2.2
while k + 1.5 < t_d1 - 1: breach.append([round(k, 2), round(k + 1.5, 2)]); k += 4.9 + .4 * len(breach) % 1.3
d = (E[5] - S[5]) / 3; slots = [[round(S[5] + i * d, 2), round(S[5] + (i + 1) * d, 2)] for i in range(3)]
meta = dict(duration=round(DUR, 2), lines=out, banner_start=round(banner_start, 2), banner_dur=BANNER_DUR, t_d0=round(t_d0, 2), t_d1=round(t_d1, 2), breach=breach, slots=slots, R=30)
(ROOT / "data/meta.json").write_text(json.dumps(meta, ensure_ascii=False))
with wave.open(str(ROOT / "build/voice.wav"), "wb") as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((voice * 32767).astype(np.int16).tobytes())
print(f"✔ {DUR:.1f} с, баннер с {banner_start:.2f}")
