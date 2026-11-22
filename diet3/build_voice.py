"""Диета 3: озвучка (Piper + Praat) → data/meta.json, build/voice.wav. Баннер строго на 60-й секунде."""
import json, re, sys, wave
from pathlib import Path
import numpy as np
ROOT = Path(__file__).resolve().parent; sys.path.insert(0, str(ROOT.parent / "engine"))
import tts
SR = 44100
NARR = dict(speaker="irina", ls=.93, pitch=1.04, range=1.75, humanize=True)
MAX = dict(speaker="denis", ls=.84, pitch=1.05, range=2.0, humanize=True)
FRI = dict(speaker="dmitri", ls=.98, pitch=.72, range=2.1, fx="reverb")
MAM = dict(speaker="irina", ls=.85, pitch=.88, range=2.3, humanize=True)
L = [
    ("narr", NARR, "День третий. Макс решил покончить с холодильником раз и навсегда.", [], .3),
    ("max", MAX, "Сегодня ты проиграешь, сука!", ["СУКА"], .25),
    ("fri", FRI, "Макс. Ты же знаешь, что у меня внутри. Сыр. Колбаса. Борщ.", [], .3),
    ("narr", NARR, "Макс закрыл глаза и пошёл в атаку. Без оружия. Только со скалкой.", [], .3),
    ("max", MAX, "Получай, железяка!", [], .15),
    ("narr", NARR, "Холодильник даже не покачнулся. Он просто открыл дверцу. И запахло борщом.", [], .35),
    ("max", MAX, "Блядь. Это нечестно.", ["БЛЯД"], .3),
    ("narr", NARR, "Макс упал на колени. Вытер слёзы скалкой. И плюнул на диету.", [], .3),
    ("fri", FRI, "Давай, Макс. Всего одну ложечку. Никто не узнает.", [], .3),
    ("max", MAX, "Одну ложечку... Только одну...", [], .25),
    ("narr", NARR, "Через минуту Макс сидел в холодильнике, как в бассейне из борща. Ел руками. Плакал от счастья.", [], .3),
    ("max", MAX, "Нахуй диету! Борщ — это здоровье!", ["НАХУЙ"], .25),
    ("narr", NARR, "И тут вошла мама.", [], .3),
    ("mam", MAM, "Максим! Ты почему сидишь в холодильнике?!", [], .2),
    ("max", MAX, "Мам, я... проверяю температуру.", [], .25),
    ("narr", NARR, "Мама посмотрела на холодильник. Холодильник посмотрел на неё.", [], .3),
    ("fri", FRI, "Мария Ивановна. Мы с Максом дружим. Присоединяйтесь.", [], .3),
    ("narr", NARR, "Мама достала ложки. Втроём они доели борщ. Диета закончилась. Дружба осталась.", [], .3),
]
BANNER_AFTER, BANNER_AT, BANNER_DUR = 15, 60.0, 5.05
cache = ROOT / "build/tts"; dflt = {"provider": "piper", "fx": None, "ns": None, "nw": None}
t = .2; chunks = [np.zeros(int(.2 * SR), np.float32)]; out = []; banner_start = None
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
    print(f"  {i:2} {who:4} {out[-1]['start']:6.2f}–{out[-1]['end']:6.2f}  {txt[:55]}")
tail = 1.6; chunks.append(np.zeros(int(tail * SR), np.float32)); DUR = t + tail
voice = np.concatenate(chunks); voice = voice / (np.abs(voice).max() + 1e-9) * .92
(ROOT / "data/meta.json").write_text(json.dumps(dict(duration=round(DUR, 2), lines=out, banner_start=round(banner_start, 2), banner_dur=BANNER_DUR), ensure_ascii=False))
with wave.open(str(ROOT / "build/voice.wav"), "wb") as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((voice * 32767).astype(np.int16).tobytes())
print(f"✔ {DUR:.1f} с, баннер с {banner_start:.2f}")
