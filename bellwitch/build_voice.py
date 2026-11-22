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
L = [  # (idx, кто, голос, текст, пауза перед репликой) — idx = номер реплики в сцене; 19+ — дополнительные
    (0, "narr", NARR, "Теннесси. Тысяча восемьсот семнадцатый год. Ферма Джона Белла.", .6),
    (1, "narr", NARR, "Однажды вечером Джон увидел на поле странное существо. Собаку с телом кролика. Он выстрелил.", .7),
    (2, "narr", NARR, "С той ночи в доме начались царапины.", 1.0),
    (3, "narr", NARR, "Тихие. В стенах. Каждую ночь. Всё громче.", 1.6),
    (4, "bet", BET, "Мама... Кто-то скребётся в стене.", 1.0),
    (5, "narr", NARR, "Потом одеяла начали срываться с кроватей. Сами.", 1.2),
    (6, "narr", NARR, "Дети слышали шёпот. Он звал их по именам.", .5),
    (7, "wit", WIT, "Бетси... Бетси...", 1.2),
    "BANNER1",
    (8, "narr", NARR, "Больше всех страдала двенадцатилетняя Бетси. Невидимая рука била её по лицу. Тянула за волосы.", 1.0),
    (9, "bet", BET, "Прекратите! Оставьте меня!", .5),
    (10, "narr", NARR, "Однажды ночью она выбежала в лес. Но тот, кто шёл за ней, был быстрее.", 1.2),
    (11, "narr", NARR, "Следы в листве появлялись прямо за её спиной. Но рядом никого не было.", .6),
    (12, "wit", WIT, "Я иду за тобой, Бетси.", .8),
    "CUT",
    (13, "narr", NARR, "Декабрь тысяча восемьсот двадцатого. Джон Белл не смог подняться с постели.", .6),
    (19, "narr", NARR, "Язык распух. Он не мог ни говорить, ни глотать. Врачи только разводили руками.", .9),
    (14, "narr", NARR, "В шкафу нашли тёмный пузырёк. Каплю дали коту. Кот умер сразу. А голос в комнате сказал:", 1.0),
    (15, "wit", WIT, "Я дала старику Джеку лишнюю дозу. Этой ночью.", .9),
    "BANNER2",
    (16, "narr", NARR, "Джон умер на следующий день. На похоронах невидимый голос пел весёлую песню о бренди. А потом смеялся.", 1.3),
    (20, "narr", NARR, "Семья молчала. Даже ветер стих.", 1.2),
    (17, "narr", NARR, "Ведьма пообещала вернуться через семь лет. И в тысяча восемьсот двадцать восьмом она вернулась.", 1.3),
    (18, "wit", WIT, "Я вернулась.", 1.4),
]
BANNER_DUR = 5.05
cache = ROOT / "build/tts"; dflt = {"provider": "piper", "fx": None, "ns": None, "nw": None}
t = .2; chunks = [np.zeros(int(.2 * SR), np.float32)]; outd = {}; banners = []; cut = None; part2_start = None; pend = None
def sil(g):
    global t
    chunks.append(np.zeros(int(g * SR), np.float32)); t += g
for it in L:
    if it == "BANNER1" or it == "BANNER2": pend = it; continue
    if it == "CUT": cut = t + 1.4; sil(2.3); part2_start = t; continue
    idx, who, v, txt, gap = it
    if pend:
        bs = t + .6; banners.append(round(bs, 2)); sil(.6 + BANNER_DUR + .6); pend = None
    elif part2_start is not None and idx == 13: pass
    else: sil(gap)
    if part2_start is not None and idx == 13: sil(.5)
    a = tts.synth({"voice": txt, **v}, dflt | v, cache, False)
    tgt = {'narr': .12, 'bet': .13, 'wit': .085}[who]; act = a[np.abs(a) > .01]; a = a * (tgt / (np.sqrt((act ** 2).mean()) + 1e-9)); a = np.tanh(a * 1.2) / 1.2
    words = tts.word_times(txt, a, t)
    outd[idx] = dict(who=who, start=round(t, 3), end=round(t + len(a) / SR, 3), text=txt, words=[[w, s_, e, False] for w, s_, e in words])
    chunks.append(a); t += len(a) / SR
    print(f"  {idx:2} {who:4} {outd[idx]['start']:6.2f}–{outd[idx]['end']:6.2f}  {txt[:55]}")
out = [outd[k] for k in sorted(outd)]
tail = 2.6; chunks.append(np.zeros(int(tail * SR), np.float32)); DUR = t + tail
voice = np.concatenate(chunks); voice = voice / max(1, np.abs(voice).max() / .95)
(ROOT / "data/meta.json").write_text(json.dumps(dict(duration=round(DUR, 2), lines=out, banners=banners, banner_start=banners[0], banner_dur=BANNER_DUR, cut=round(cut, 2), part2_start=round(part2_start, 2)), ensure_ascii=False))
with wave.open(str(ROOT / "build/voice.wav"), "wb") as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((voice * 32767).astype(np.int16).tobytes())
print(f"✔ {DUR:.1f} с, баннеры {banners}, разрез {cut:.2f}, часть 2 с {part2_start:.2f}")
