"""Озвучка: синтезирует каждый сегмент сценария голосом Piper и строит таймлайн.

Выход:
  build/voice.wav      — вся дорожка голоса, 44.1 кГц моно
  build/timeline.json  — сцены и сегменты с абсолютным временем (для видео и звука)
"""
import json
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np
from piper import PiperVoice, SynthesisConfig

ROOT = Path(__file__).resolve().parent
BUILD = ROOT / "build"
SR = 44100


def load_voice(name: str) -> PiperVoice:
    d = ROOT / ".cache" / "voices" / f"vits-piper-ru_RU-{name}-medium"
    return PiperVoice.load(str(d / f"ru_RU-{name}-medium.onnx"),
                           config_path=str(d / f"ru_RU-{name}-medium.onnx.json"))


def synth(voice: PiperVoice, text: str, length_scale: float, tmp: Path) -> np.ndarray:
    raw = tmp.with_suffix(".raw.wav")
    with wave.open(str(raw), "wb") as w:
        voice.synthesize_wav(text, w, syn_config=SynthesisConfig(length_scale=length_scale))
    # ресемплинг до 44.1 кГц + лёгкая обработка голоса (срез низа, компрессия, «присутствие»)
    subprocess.run([
        "ffmpeg", "-v", "error", "-y", "-i", str(raw),
        "-af", "highpass=f=90,equalizer=f=3200:t=q:w=1.2:g=3,"
               "acompressor=threshold=-20dB:ratio=3:attack=5:release=80:makeup=4",
        "-ar", str(SR), "-ac", "1", str(tmp)], check=True)
    with wave.open(str(tmp)) as w:
        a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    return trim(a)


def trim(a: np.ndarray, thr: float = 0.012) -> np.ndarray:
    """Срезает тишину по краям, оставляя по 30 мс."""
    win = 441
    env = np.convolve(np.abs(a), np.ones(win) / win, mode="same")
    idx = np.where(env > thr)[0]
    if len(idx) == 0:
        return a
    pad = int(0.03 * SR)
    return a[max(0, idx[0] - pad): min(len(a), idx[-1] + pad)]


def main():
    script = json.loads((ROOT / "script.json").read_text())
    BUILD.mkdir(exist_ok=True)
    tmpdir = BUILD / "tts"
    tmpdir.mkdir(exist_ok=True)
    voice = load_voice(script["voice"])

    chunks, t = [], 0.0
    timeline = {"scenes": []}
    for si, sc in enumerate(script["scenes"]):
        start = t
        if si == 0:
            chunks.append(np.zeros(int(script["lead_in"] * SR), np.float32))
            t += script["lead_in"]
        segs = []
        for gi, seg in enumerate(sc["segments"]):
            if gi > 0:
                g = script["gap_in_scene"]
                chunks.append(np.zeros(int(g * SR), np.float32))
                t += g
            a = synth(voice, seg["voice"], seg.get("ls", script["length_scale"]), tmpdir / f"{si:02d}_{gi}.wav")
            segs.append({**seg, "start": round(t, 3), "end": round(t + len(a) / SR, 3)})
            chunks.append(a)
            t += len(a) / SR
        g = script["tail"] if si == len(script["scenes"]) - 1 else script["gap_between_scenes"]
        chunks.append(np.zeros(int(g * SR), np.float32))
        t += g
        timeline["scenes"].append({k: v for k, v in sc.items() if k != "segments"}
                                  | {"start": round(start, 3), "end": round(t, 3), "segments": segs})
        print(f"{sc['id']:<11} {start:6.2f} → {t:6.2f}  ({t - start:.2f} c)")

    # сегменты сцены начинаются раньше конца предыдущей сцены нельзя — проверим
    voice_track = np.concatenate(chunks)
    peak = np.max(np.abs(voice_track))
    voice_track = voice_track / peak * 0.89
    with wave.open(str(BUILD / "voice.wav"), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((voice_track * 32767).astype(np.int16).tobytes())
    timeline["duration"] = round(t, 3)
    timeline["handle"] = script["handle"]
    (BUILD / "timeline.json").write_text(json.dumps(timeline, ensure_ascii=False, indent=1))
    print(f"итого: {t:.2f} c")


if __name__ == "__main__":
    sys.exit(main())
