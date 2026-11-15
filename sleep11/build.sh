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

if [ "${1:-}" = "--voice" ] || [ ! -f build/voice.wav ]; then
  echo "▸ озвучка"; python3 tts.py
fi
echo "▸ кадры";   node render.js
echo "▸ звук";    python3 audio.py
echo "▸ кодирование"
ffmpeg -v error -y -framerate 30 -i build/frames/%05d.jpg -i build/mix.wav \
  -c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p -profile:v high \
  -c:a aac -b:a 192k -shortest -movflags +faststart sleep11_demo.mp4
echo "✔ готово: $(pwd)/sleep11_demo.mp4"
