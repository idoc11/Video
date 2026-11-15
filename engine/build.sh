#!/usr/bin/env bash
# Сборка ролика: engine/build.sh <папка ролика> [--voice]   (--voice — переозвучить всё заново)
set -euo pipefail
ENGINE="$(cd "$(dirname "$0")" && pwd)"
VDIR="$(cd "$1" && pwd)"
for v in dmitri denis irina; do
  if [ ! -f "$ENGINE/.cache/voices/vits-piper-ru_RU-$v-medium/ru_RU-$v-medium.onnx" ]; then
    mkdir -p "$ENGINE/.cache/voices"
    curl -sSL https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/vits-piper-ru_RU-$v-medium.tar.bz2 | tar xj -C "$ENGINE/.cache/voices"
  fi
done
echo "▸ озвучка";  python3 "$ENGINE/tts.py" "$VDIR" ${2:+--fresh}
echo "▸ кадры";    node "$ENGINE/render.js" "$VDIR"
echo "▸ звук";     python3 "$ENGINE/audio.py" "$VDIR"
echo "▸ монтаж";   python3 "$ENGINE/compose.py" "$VDIR"
