"""Озвучка с «режиссурой»: python3 engine/tts.py <папка ролика> [--fresh]

Каждая реплика в script.json может задавать:
  speaker  — голос Piper (dmitri, denis, irina, ruslan)
  ls       — темп (меньше = быстрее)
  pitch    — высота голоса (множитель, 0.9 = ниже)
  range    — размах интонации (1 = как у Piper, 1.7 = живой рассказчик, 2+ = драматично)
  fx       — эффект: echo (воспоминание), reverb (жуть), radio
  gap      — пауза перед репликой, сек
Реплики кэшируются в build/tts по содержимому — повторная сборка не меняет голос.
"""
import difflib
import hashlib
import json
import re
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np
import parselmouth
from parselmouth.praat import call
from piper import PiperVoice, SynthesisConfig

ENGINE = Path(__file__).resolve().parent
SR = 44100
_voices = {}

FX = {
    "echo": "apad=pad_dur=0.9,lowpass=f=5000,aecho=0.8:0.75:140|280:0.42|0.24",
    "reverb": "apad=pad_dur=0.8,aecho=0.85:0.7:50|95|160|240:0.32|0.24|0.18|0.12",
    "radio": "highpass=f=350,lowpass=f=3400,acrusher=bits=10:mix=0.25",
    "air": "apad=pad_dur=0.5,aecho=0.8:0.45:60|120:0.2|0.1",
    "memory": "apad=pad_dur=0.6,lowpass=f=6000,aecho=0.8:0.5:90|180:0.22|0.1",
}
_asr = None


def asr():
    """Распознавание речи для выбора лучшего дубля (если модель скачана)."""
    global _asr
    if _asr is None:
        d = ENGINE / ".cache" / "asr" / "sherpa-onnx-small-zipformer-ru-2024-09-18"
        if not d.exists():
            _asr = False
        else:
            import sherpa_onnx
            _asr = sherpa_onnx.OfflineRecognizer.from_transducer(
                encoder=str(d / "encoder.int8.onnx"), decoder=str(d / "decoder.onnx"),
                joiner=str(d / "joiner.int8.onnx"), tokens=str(d / "tokens.txt"), num_threads=4)
    return _asr


def clarity(a, text):
    rec = asr()
    s = rec.create_stream(); s.accept_waveform(SR, a); rec.decode_stream(s)
    n = lambda x: re.sub(r"[^а-я ]", "", x.lower().replace("ё", "е"))
    return difflib.SequenceMatcher(None, n(text).replace(" ", ""), n(s.result.text).replace(" ", "")).ratio()


def voice(name):
    if name not in _voices:
        d = ENGINE / ".cache" / "voices" / f"vits-piper-ru_RU-{name}-medium"
        _voices[name] = PiperVoice.load(str(d / f"ru_RU-{name}-medium.onnx"), config_path=str(d / f"ru_RU-{name}-medium.onnx.json"))
    return _voices[name]


def load(path):
    with wave.open(str(path)) as w:
        return np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768


def trim(a, thr=0.012, tail_thr=None):
    win = 441
    env = np.convolve(np.abs(a), np.ones(win) / win, mode="same")
    idx = np.where(env > thr)[0]
    if len(idx) == 0:
        return a
    end_idx = np.where(env > (tail_thr or thr))[0][-1]
    pad = int(0.03 * SR)
    return a[max(0, idx[0] - pad): min(len(a), end_idx + pad)]


def synth(seg, dflt, cache, fresh):
    o = {k: seg.get(k, dflt.get(k)) for k in ("speaker", "ls", "pitch", "range", "fx", "ns", "nw", "humanize", "provider", "voice_id", "model", "stability")}
    if o["humanize"]:  # живой чтец не говорит с одинаковой скоростью
        o["ls"] = round(o["ls"] * (1 + ((int(hashlib.md5(seg["voice"].encode()).hexdigest(), 16) % 9) - 4) / 100), 3)
    key = hashlib.md5(json.dumps([seg["voice"], o], sort_keys=True, ensure_ascii=False).encode()).hexdigest()[:12]
    out = cache / f"{key}.wav"
    if fresh or not out.exists():
        best, score = None, -1
        takes = 2 if o["provider"] == "elevenlabs" else 5   # ElevenLabs платный по символам — максимум 2 дубля
        for take in range(takes if asr() else 1):
            a = render_take_el(seg, o, cache, key) if o["provider"] == "elevenlabs" else render_take(seg, o, cache, key)
            sc_ = clarity(a, seg["voice"]) if asr() else 1
            if sc_ > score:
                best, score = a, sc_
            if score >= .96:
                break
        with wave.open(str(out), "wb") as w:
            w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
            w.writeframes((best * 32767).astype(np.int16).tobytes())
        print(f"    дубль {take + 1}, разборчивость {score:.0%}: {seg['voice'][:50]}")
    tempo = seg.get("tempo", dflt.get("tempo"))
    if tempo and tempo != 1:  # ускорение без смены высоты голоса (кэшируется отдельно)
        tout = cache / f"{key}.t{tempo}.wav"
        if fresh or not tout.exists():
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(out), "-af", f"atempo={tempo}", str(tout)], check=True)
        out = tout
    return trim(load(out), tail_thr=0.003 if o["fx"] else None)


def render_take_el(seg, o, cache, key):
    """Озвучка ElevenLabs. Ключ подставляет сетевой прокси окружения (в коде его нет)."""
    mp3, out = cache / f"{key}.el.mp3", cache / f"{key}.take.wav"
    body = {"text": seg["voice"], "model_id": o["model"] or "eleven_v3",
            "voice_settings": {"stability": o["stability"] if o["stability"] is not None else 0.5}}
    r = subprocess.run(["curl", "-sS", "-m", "120", "-X", "POST",
                        f"https://api.elevenlabs.io/v1/text-to-speech/{o['voice_id']}?output_format=mp3_44100_128",
                        "-H", "xi-api-key: proxy-injected", "-H", "Content-Type: application/json",
                        "--data-binary", json.dumps(body, ensure_ascii=False), "-o", str(mp3), "-w", "%{http_code}"],
                       capture_output=True, text=True)
    if r.stdout.strip() != "200":
        raise RuntimeError(f"ElevenLabs HTTP {r.stdout.strip()}: {mp3.read_text(errors='ignore')[:300] if mp3.exists() else r.stderr}")
    chain = "highpass=f=60,acompressor=threshold=-20dB:ratio=2:attack=10:release=150:makeup=2"
    if o["fx"]:
        chain += "," + FX[o["fx"]]
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(mp3), "-af", chain, "-ar", str(SR), "-ac", "1", str(out)], check=True)
    return trim(load(out), thr=0.008, tail_thr=0.003 if o["fx"] else None)


def render_take(seg, o, cache, key):
    out = cache / f"{key}.take.wav"
    if True:
        raw, pr = cache / f"{key}.raw.wav", cache / f"{key}.pr.wav"
        with wave.open(str(raw), "wb") as w:
            voice(o["speaker"]).synthesize_wav(seg["voice"], w, syn_config=SynthesisConfig(
                length_scale=o["ls"], noise_scale=o["ns"] or .7, noise_w_scale=o["nw"] or .9))
        # интонация: Praat (PSOLA) растягивает мелодику фразы и сдвигает высоту
        snd = parselmouth.Sound(str(raw))
        med = call(snd.to_pitch(pitch_floor=75, pitch_ceiling=500), "Get quantile", 0, 0, 0.5, "Hertz") or 150
        snd = call(snd, "Change gender", 75, 500, 1.0, med * (o["pitch"] or 1.0), o["range"] or 1.0, 1.0)
        snd.scale_peak(0.9)
        snd.save(str(pr), "WAV")
        chain = "highpass=f=90,equalizer=f=3200:t=q:w=1.2:g=3,acompressor=threshold=-20dB:ratio=3:attack=5:release=80:makeup=4"
        if o["humanize"]:
            chain = ("highpass=f=70,lowpass=f=9500,equalizer=f=170:t=q:w=1:g=2.5,equalizer=f=2800:t=q:w=1.4:g=2,"
                     "acompressor=threshold=-22dB:ratio=2.5:attack=8:release=120:makeup=4,aecho=0.85:0.3:17|29:0.1|0.07")
        if o["fx"]:
            chain += "," + FX[o["fx"]]
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(pr), "-af", chain, "-ar", str(SR), "-ac", "1", str(out)], check=True)
    return trim(load(out), tail_thr=0.003 if o["fx"] else None)


def word_times(text, a, t0):
    """Время каждого слова: распределяем по слогам внутри реально звучащего участка реплики."""
    words = [w for w in re.sub(r"\[[^\]]*\]", " ", text).split() if re.search(r"[\wа-яё0-9]", w, re.I)]
    if not words:
        return []
    win = int(.02 * SR)
    env = np.sqrt(np.convolve(a.astype(np.float64) ** 2, np.ones(win) / win, mode="same"))
    on = np.where(env > .12 * env.max())[0]
    s0, s1 = (on[0] / SR, on[-1] / SR) if len(on) else (0, len(a) / SR)
    w8 = [max(1, len(re.findall(r"[аеёиоуыэюяaeiou]", w.lower()))) + (.6 if re.search(r"[.,!?…—:]$", w) else 0) for w in words]
    tot, acc, out = sum(w8), 0.0, []
    for w, k in zip(words, w8):
        a_ = s0 + (s1 - s0) * acc / tot; acc += k; b_ = s0 + (s1 - s0) * acc / tot
        out.append([w, round(t0 + a_, 3), round(t0 + b_, 3)])
    # уточнение по реальному звуку: отметки времени слов из распознавания речи (выравнивание по тексту)
    rec = asr()
    if rec:
        st = rec.create_stream(); st.accept_waveform(SR, a); rec.decode_stream(st)
        r = st.result; aw, cur = [], None
        for tok, ts in zip(r.tokens, r.timestamps):
            if tok.startswith("▁") or cur is None:
                cur = [tok.lstrip("▁"), ts]; aw.append(cur)
            else:
                cur[0] += tok
        norm = lambda x: re.sub(r"[^а-я0-9]", "", x.lower().replace("ё", "е"))
        sm = difflib.SequenceMatcher(None, [norm(w) for w in words], [norm(w[0]) for w in aw])
        fixed = {}
        for tag, i1, i2, j1, j2 in sm.get_opcodes():
            if tag == "equal":
                for k in range(i2 - i1): fixed[i1 + k] = aw[j1 + k][1]
            elif tag == "replace" and i2 - i1 == j2 - j1:
                for k in range(i2 - i1): fixed[i1 + k] = aw[j1 + k][1]
        if len(fixed) >= max(1, len(words) // 2):
            starts = [fixed.get(i) for i in range(len(words))]
            for i in range(len(words)):        # пропуски — интерполяция между соседями
                if starts[i] is None:
                    prev = next((j for j in range(i - 1, -1, -1) if starts[j] is not None), None)
                    nxt = next((j for j in range(i + 1, len(words)) if starts[j] is not None), None)
                    pa = starts[prev] if prev is not None else s0; na = starts[nxt] if nxt is not None else s1
                    pi = prev if prev is not None else -1; ni = nxt if nxt is not None else len(words)
                    starts[i] = pa + (na - pa) * (i - pi) / (ni - pi)
            starts = [max(0, x - .04) for x in starts]
            out = [[w, round(t0 + starts[i], 3), round(t0 + (starts[i + 1] if i + 1 < len(words) else s1), 3)] for i, w in enumerate(words)]
    return out


def breath(seed):
    """Тихий вдох: шум с формантой около 1 кГц и плавной огибающей."""
    r = np.random.default_rng(seed); d = .26 + .1 * r.random(); n = int(d * SR)
    X = np.fft.rfft(r.normal(0, 1, n)); fr = np.fft.rfftfreq(n, 1 / SR)
    x = np.fft.irfft(X * np.exp(-((np.log2(np.maximum(fr, 1) / 1150)) ** 2) / .8), n)
    t = np.arange(n) / SR
    return (x / np.abs(x).max() * np.sin(np.pi * t / d) ** 1.8 * .055).astype(np.float32)


def silence(g, breathe, seed):
    z = np.zeros(int(g * SR), np.float32)
    if breathe and g >= .2 and seed % 5 != 3:
        b = breath(seed)[: max(0, len(z) - int(.04 * SR))]
        z[len(z) - int(.04 * SR) - len(b): len(z) - int(.04 * SR)] += b
    return z


def main():
    vdir = Path(sys.argv[1]).resolve()
    fresh = "--fresh" in sys.argv
    script = json.loads((vdir / "script.json").read_text())
    build = vdir / "build"
    cache = build / "tts"
    cache.mkdir(parents=True, exist_ok=True)
    dflt = {"speaker": "dmitri", "ls": .88, "pitch": 1.0, "range": 1.0, "fx": None} | script.get("narrator", {})
    banner = script.get("banner")

    chunks, t = [], 0.0
    tl = {"scenes": []}
    for si, sc in enumerate(script["scenes"]):
        start = t
        if si == 0:
            chunks.append(np.zeros(int(script.get("lead_in", .1) * SR), np.float32))
            t += script.get("lead_in", .1)
        segs = []
        for gi, seg in enumerate(sc["segments"]):
            if gi > 0:
                g = seg.get("gap", script.get("gap_in_scene", .12))
                chunks.append(silence(g, dflt.get("humanize"), si * 10 + gi))
                t += g
            a = synth(seg, dflt, cache, fresh) * seg.get("gain", 1.0)
            seg_out = {"caption": seg["caption"], "voice": seg["voice"], "start": round(t, 3), "end": round(t + len(a) / SR, 3)}
            if script.get("style") == "cinema":
                seg_out["words"] = word_times(seg["voice"], a, t)
            segs.append(seg_out)
            chunks.append(a)
            t += len(a) / SR
        g = script.get("tail", .9) if si == len(script["scenes"]) - 1 else sc.get("gap_after", script.get("gap_between_scenes", .16))
        if banner and banner["after_scene"] == sc["id"]:
            chunks.append(np.zeros(int(.12 * SR), np.float32))
            t += .12
            tl["banner"] = {"start": round(t, 3), "dur": banner["dur"]}
            g = banner["dur"] - .1
        chunks.append(silence(g, dflt.get("humanize") and not (banner and banner["after_scene"] == sc["id"]), si * 10 + 7))
        t += g
        tl["scenes"].append({k: v for k, v in sc.items() if k != "segments"} | {"start": round(start, 3), "end": round(t, 3), "segments": segs})
        print(f"  {sc['id']:<10} {start:6.2f} → {t:6.2f}")

    track = np.concatenate(chunks)
    track = track / np.max(np.abs(track)) * 0.89
    with wave.open(str(build / "voice.wav"), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((track * 32767).astype(np.int16).tobytes())
    tl |= {"duration": round(t, 3), "handle": script["handle"], "hud": script.get("hud"), "wipe": script.get("wipe"), "style": script.get("style"), "tag": script.get("tag")}
    (build / "timeline.json").write_text(json.dumps(tl, ensure_ascii=False, indent=1))
    print(f"  итого {t:.2f} c")


if __name__ == "__main__":
    main()
