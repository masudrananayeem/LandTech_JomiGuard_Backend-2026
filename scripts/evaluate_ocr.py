#!/usr/bin/env python3
"""Evaluate OCR output against a manually verified JSONL ground-truth file.
Each line: {"id":"img001","ground_truth":"...","prediction":"...","split":"test"}
Reports CER/WER only; does not train or run OCR and does not imply legal validity.
"""
import argparse, json, re
from pathlib import Path

def normalize(s):
    return re.sub(r"\s+", " ", s.strip())

def edit_distance(a, b):
    prev = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        cur = [i]
        for j, cb in enumerate(b, 1):
            cur.append(min(cur[-1] + 1, prev[j] + 1, prev[j-1] + (ca != cb)))
        prev = cur
    return prev[-1]

def main():
    p = argparse.ArgumentParser()
    p.add_argument("manifest", help="JSONL containing id, ground_truth, prediction, split")
    p.add_argument("--split", default="test", choices=["train", "validation", "test", "all"])
    args = p.parse_args()
    path = Path(args.manifest)
    rows = [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]
    if args.split != "all": rows = [r for r in rows if r.get("split") == args.split]
    if not rows: raise SystemExit("No rows selected. Check manifest and split labels.")
    chars = words = char_den = word_den = 0
    for r in rows:
        gt, pred = normalize(r["ground_truth"]), normalize(r["prediction"])
        chars += edit_distance(gt, pred); words += edit_distance(gt.split(), pred.split())
        char_den += len(gt); word_den += len(gt.split())
    print(json.dumps({"manifest": str(path), "split": args.split, "n": len(rows), "CER": chars / max(1, char_den), "WER": words / max(1, word_den), "warning": "Only valid when ground truth is manually verified and split leakage is prevented. OCR metrics do not establish legal validity."}, ensure_ascii=False, indent=2))
if __name__ == "__main__": main()
