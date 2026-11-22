"""Ведьма Белл: озвучка (Piper + Praat) → data/meta.json, build/voice.wav. Баннер строго на 60-й секунде."""
import json, re, sys, wave
from pathlib import Path
import numpy as np
ROOT = Path(__file__).resolve().parent; sys.path.insert(0, str(ROOT.parent / "engine"))
import tts
SR = 44100
NARR = dict(speaker="ruslan", ls=1.02, pitch=.88, range=1.5)                 # низкий документальный голос
BET = dict(speaker="irina", ls=.92, pitch=1.3, range=2.2)                              # испуганная девочка
WIT = dict(speaker="irina", ls=1.2, pitch=.55, range=1.2)                 # шёпот ведьмы: низко, медленно, с эхом
L = [  # кто, голос, текст, мат-приставки, пауза перед репликой
    ("narr", NARR, "Теннесси. Тысяча восемьсот семнадцатый год. Ферма Джона Белла.", [], .6),
    ("narr", NARR, "Однажды вечером Джон увидел на поле странное существо. Собаку с телом кролика. Он выстрелил.", [], .7),
    ("narr", NARR, "С той ночи в доме начались царапины.", [], 1.0),
    ("narr", NARR, "Тихие. В стенах. Каждую ночь. Всё громче.", [], 1.6),
    ("bet", BET, "Мама... Кто-то скребётся в стене.", [], 1.0),
    ("narr", NARR, "Потом одеяла начали срываться с кроватей. Сами.", [], 1.2),
    ("narr", NARR, "Дети слышали шёпот. Он звал их по именам.", [], .5),
    ("wit", WIT, "Бетси... Бетси...", [], 1.2),
    ("narr", NARR, "Больше всех страдала двенадцатилетняя Бетси. Невидимая рука била её по лицу. Тянула за волосы.", [], 1.0),
    ("bet", BET, "Прекратите! Оставьте меня!", [], .5),
    ("narr", NARR, "Однажды ночью она выбежала в лес. Но тот, кто шёл за ней, был быстрее.", [], 1.2),
    ("narr", NARR, "Следы в листве появлялись прямо за её спиной. Но рядом никого не было.", [], .6),
    ("wit", WIT, "Я иду за тобой, Бетси.", [], .8),
    ("narr", NARR, "Декабрь тысяча восемьсот двадцатого. Джон Белл не смог подняться с постели.", [], .6),
    ("narr", NARR, "В шкафу нашли тёмный пузырёк. А голос в комнате сказал:", [], .7),
    ("wit", WIT, "Я дала старику Джеку лишнюю дозу. Этой ночью.", [], .9),
    ("narr", NARR, "Джон умер на следующий день. На похоронах невидимый голос пел весёлую песню о бренди.", [], 1.3),
    ("narr", NARR, "Ведьма пообещала вернуться через семь лет. И в тысяча восемьсот двадцать восьмом она вернулась.", [], 1.3),
    ("wit", WIT, "Я вернулась.", [], 1.4),
]
BANNER_AFTER, BANNER_AT, BANNER_DUR = 12, 60.0, 5.05
cache = ROOT / "build/tts"; dflt = {"provider": "piper", "fx": None, "ns": None, "nw": None}
t = .2; chunks = [np.zeros(int(.2 * SR), np.float32)]; out = []; banner_start = None
for i, (who, v, txt, fade, gap) in enumerate(L):
    if i == BANNER_AFTER + 1:
        banner_start = max(t + .3, BANNER_AT); g = banner_start + BANNER_DUR + .6 - t
        chunks.append(np.zeros(int(g * SR), np.float32)); t += g
    else:
        chunks.append(np.zeros(int(gap * SR), np.float32)); t += gap
    a = tts.synth({"voice": txt, **v}, dflt | v, cache, False)
    tgt = {'narr': .12, 'bet': .13, 'wit': .085}[who]; act = a[np.abs(a) > .01]; a = a * (tgt / (np.sqrt((act ** 2).mean()) + 1e-9)); a = np.tanh(a * 1.2) / 1.2   # одинаковая громкость реплик, мягкий лимитер
    words = tts.word_times(txt, a, t)
    out.append(dict(who=who, start=round(t, 3), end=round(t + len(a) / SR, 3), text=txt, words=[[w, s, e, False] for w, s, e in words]))
    chunks.append(a); t += len(a) / SR
    print(f"  {i:2} {who:4} {out[-1]['start']:6.2f}–{out[-1]['end']:6.2f}  {txt[:55]}")
tail = 2.6; chunks.append(np.zeros(int(tail * SR), np.float32)); DUR = t + tail
voice = np.concatenate(chunks); voice = voice / max(1, np.abs(voice).max() / .95)
(ROOT / "data/meta.json").write_text(json.dumps(dict(duration=round(DUR, 2), lines=out, banner_start=round(banner_start, 2), banner_dur=BANNER_DUR), ensure_ascii=False))
with wave.open(str(ROOT / "build/voice.wav"), "wb") as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((voice * 32767).astype(np.int16).tobytes())
print(f"✔ {DUR:.1f} с, баннер с {banner_start:.2f}")
