#!/usr/bin/env python3
"""'Healing/힐링' 같은 모호한 의료성 표현 → 안전한 휴식 표현으로."""
import json
import re
from pathlib import Path

LOCALES_DIR = Path(__file__).parent.parent / "src/i18n/locales"

# 언어별 안전 표현 매핑
REPLACEMENTS = [
    # (regex pattern, replacement) — 가장 긴 것부터
    (r"Healing Sounds", "Soothing Sounds"),
    (r"healing sounds", "soothing sounds"),
    (r"Water Healing", "Water Calm"),
    (r"water healing", "water calm"),
    (r"deeper healing", "deeper calm"),
    (r"Deeper Healing", "Deeper Calm"),
    (r"Healing", "Soothing"),
    (r"healing", "soothing"),
    # 한국어
    (r"힐링 사운드", "쉼의 사운드"),
    (r"더 깊은 힐링", "더 깊은 쉼"),
    (r"풀밭에 누워 힐링", "풀밭에 누워 쉼"),
    (r"물소리 힐링", "물소리 명상"),
    (r"힐링", "쉼"),
    # 일본어
    (r"ヒーリング", "癒し"),  # heeling → iyashi (소ootheing)
    # 중국어 (간/번체)
    (r"治愈", "舒缓"),  # 치유 → 부드러움
    (r"療癒", "舒緩"),
    # 독일
    (r"Heilung", "Beruhigung"),
    # 프랑스어
    (r"Guérison", "Apaisement"),
    (r"guérison", "apaisement"),
    # 스페인어
    (r"Sanación", "Calma"),
    (r"sanación", "calma"),
    # 이탈리아어
    (r"Guarigione", "Calma"),
    (r"guarigione", "calma"),
    # 포르투갈어
    (r"Cura", "Calma"),
    # 러시아어
    (r"Исцеление", "Успокоение"),
    (r"исцеление", "успокоение"),
    # 아랍어
    (r"شفاء", "هدوء"),
    # 힌디어
    (r"उपचार", "शांति"),
    # 베트남어
    (r"Chữa lành", "Thư giãn"),
    # 태국어
    (r"การรักษา", "ผ่อนคลาย"),
    # 인도네시아어
    (r"Penyembuhan", "Ketenangan"),
    # 터키어
    (r"İyileşme", "Sakinlik"),
    # 네덜란드어
    (r"Genezing", "Rust"),
    # 폴란드어
    (r"Uzdrawianie", "Spokój"),
    # 스웨덴어
    (r"Läkning", "Lugn"),
]


def sanitize_text(text):
    for pat, rep in REPLACEMENTS:
        text = re.sub(pat, rep, text)
    return text


def walk_and_sanitize(obj):
    if isinstance(obj, dict):
        return {k: walk_and_sanitize(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [walk_and_sanitize(x) for x in obj]
    elif isinstance(obj, str):
        return sanitize_text(obj)
    return obj


updated = 0
for path in sorted(LOCALES_DIR.glob("*.json")):
    with path.open("r", encoding="utf-8") as f:
        data = json.load(f)
    new_data = walk_and_sanitize(data)
    if new_data != data:
        with path.open("w", encoding="utf-8") as f:
            json.dump(new_data, f, ensure_ascii=False, indent=2)
            f.write("\n")
        print(f"✓ {path.name}")
        updated += 1

print(f"\n{updated} locale(s) updated.")
