#!/usr/bin/env python3
"""
Apple 심사 대응 — 모든 locale 의 music.tags 의료성 표현 안전화.

제거 대상:
- 정량적 주장 (−50%, −15%, ↑, ↓)
- 임상/Clinical/MIT 같은 의료 권위 인용
- "Healing/힐링" — 치료 암시
- 호르몬은 일반 표현으로 (옥시토신 → 따뜻함 등)

한국어는 한국어로, 나머지 19개 언어는 영어 표현으로 통일.
v1.0.x 에서 각 언어로 재번역 예정.
"""
import json
from pathlib import Path

LOCALES_DIR = Path(__file__).parent.parent / "src/i18n/locales"

# 한국어 — 자연스러운 한국어 표현
TAGS_KO = {
    "waterfall": "핑크노이즈 · 활력",
    "rain": "핑크노이즈 · 깊은 잠",
    "ocean": "0.5Hz · 차분함",
    "stream": "알파파 · 이완",
    "bird": "피톤치드 · 청량함",
    "forest": "산림욕 · 평온",
    "meadow": "알파파 · 햇살",
    "wind": "핑크노이즈 · 백색소음",
    "cave": "델타파 · 물방울",
    "fire": "60Hz · 따뜻함",
    "night": "델타파 · 수면",
    "storm": "핑크노이즈 · 깊은 잠",
    "cafe": "브라운노이즈 · 집중",
    "brown": "델타파 · 수면",
    "pink": "세타파 · 차분함",
    "white": "베타파 · 집중",
    "432": "432Hz · 명상",
    "528": "528Hz · 따뜻함",
    "40": "감마파 · 집중",
}

# 영어 — 나머지 19개 언어 통일 (v1.0.x 에서 재번역)
TAGS_EN = {
    "waterfall": "Pink Noise · Energy",
    "rain": "Pink Noise · Deep Sleep",
    "ocean": "0.5Hz · Calm",
    "stream": "Alpha · Relaxation",
    "bird": "Phytoncide · Fresh",
    "forest": "Forest Bathing · Peaceful",
    "meadow": "Alpha · Sunshine",
    "wind": "Pink Noise · White Noise",
    "cave": "Delta · Droplets",
    "fire": "60Hz · Warmth",
    "night": "Delta · Sleep",
    "storm": "Pink Noise · Deep Sleep",
    "cafe": "Brown Noise · Focus",
    "brown": "Delta · Sleep",
    "pink": "Theta · Calm",
    "white": "Beta · Focus",
    "432": "432Hz · Meditation",
    "528": "528Hz · Warmth",
    "40": "Gamma · Focus",
}


def update_locale(path: Path, tags: dict):
    with path.open("r", encoding="utf-8") as f:
        data = json.load(f)
    if "music" in data and "tags" in data["music"]:
        # 기존 키만 업데이트 (locale 에 없는 키는 무시)
        for k, v in tags.items():
            if k in data["music"]["tags"]:
                data["music"]["tags"][k] = v
        with path.open("w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            f.write("\n")
        return True
    return False


updated = 0
for path in sorted(LOCALES_DIR.glob("*.json")):
    lang = path.stem
    tags = TAGS_KO if lang == "ko" else TAGS_EN
    if update_locale(path, tags):
        print(f"✓ {lang}.json")
        updated += 1
    else:
        print(f"  {lang}.json — no music.tags found, skipped")

print(f"\n{updated} locale(s) updated.")
