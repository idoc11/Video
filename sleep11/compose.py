"""Финальный монтаж ролика про сон — общим скриптом движка (кадры + звук + баннер)."""
import json, pathlib, runpy, sys
root = pathlib.Path(__file__).resolve().parent
s = json.loads((root / "script.json").read_text())
s.setdefault("output", "sleep11_demo.mp4")
sys.argv = ["compose.py", str(root)]
runpy.run_path(str(root.parent / "engine" / "compose.py"), run_name="__main__")
