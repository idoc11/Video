#!/usr/bin/env bash
# Сборка ролика целиком: озвучка → кадры → звук → mp4.
#   ./build.sh          — собрать (озвучка пересоздаётся, только если её нет)
#   ./build.sh --voice  — пересоздать озвучку заново
set -euo pipefail
cd "$(dirname "$0")"

VOICE_DIR=.cache/voices/vits-piper-ru_RU-dmitri-medium
if [ ! -f "$VOICE_DIR/ru_RU-dmitri-medium.onnx" ]; then
  echo "▸ скачиваю голос Piper (dmitri)…"
  mkdir -p .cache/voices
  curl -sSL -o .cache/voices/dmitri.tar.bz2 \
    https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/vits-piper-ru_RU-dmitri-medium.tar.bz2
  tar xjf .cache/voices/dmitri.tar.bz2 -C .cache/voices && rm .cache/voices/dmitri.tar.bz2
fi

echo "▸ озвучка (готовые реплики берутся из build/tts; --voice — озвучить заново)"
if [ "${1:-}" = "--voice" ]; then python3 tts.py --fresh; else python3 tts.py; fi
echo "▸ кадры";   node render.js
echo "▸ звук";    python3 audio.py
echo "▸ монтаж с баннером и кодирование"
python3 compose.py
