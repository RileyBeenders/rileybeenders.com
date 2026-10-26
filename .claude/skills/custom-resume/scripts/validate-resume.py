"""Validate a generated resume PDF the way the custom-resume procedure requires.

    python .claude/skills/custom-resume/scripts/validate-resume.py <resume.pdf> <pages> [--png <dir>]

Checks: exact page count at 612 x 792 pt; lowest text line per page (the last page
should end at y >= 726 pt when the page is meant to be full); every link annotation
with its visible text; link text coloured link-blue with a drawn underline; no claim
repeated verbatim across the document; headings extract as plain words (no letter-
spaced "E D U C A T I O N"); and optional page renders for visual inspection.
Needs pymupdf (``python -m pip install pymupdf``). Exit code 1 on any failure.
"""
import re
import sys
from collections import Counter

import pymupdf

LINK_BLUE = 0x0B57D0
HEADINGS = ("PROFESSIONAL SUMMARY", "CORE EXPERTISE", "PROFESSIONAL EXPERIENCE",
            "ADDITIONAL RELEVANT EXPERIENCE", "EDUCATION")


def main(argv):
    if len(argv) < 3:
        print(__doc__)
        return 2
    pdf, want = argv[1], int(argv[2])
    png_dir = argv[argv.index("--png") + 1] if "--png" in argv else None
    doc = pymupdf.open(pdf)
    failures = []
    print(f"pages: {len(doc)} (want {want})")
    if len(doc) != want:
        failures.append("page count")
    all_text = []
    for i, page in enumerate(doc):
        r = page.rect
        if round(r.width) != 612 or round(r.height) != 792:
            failures.append(f"page {i + 1} size {r.width:.0f}x{r.height:.0f}")
        lowest, first = 0.0, None
        spans = [s for b in page.get_text("dict")["blocks"] for l in b.get("lines", []) for s in l["spans"]]
        for s in spans:
            if s["text"].strip():
                lowest = max(lowest, s["bbox"][3])
                first = s["bbox"][1] if first is None else first
        print(f"page {i + 1}: {r.width:.0f}x{r.height:.0f}pt  first text y={first:.1f}  lowest text y={lowest:.1f}")
        if i == len(doc) - 1 and lowest < 726:
            print(f"   note: last page ends {762 - lowest:.0f}pt above the bottom margin")
        links = page.get_links()
        for L in links:
            rect = L["from"]
            text = page.get_textbox(rect).strip()
            blue = [s for s in spans if s["color"] == LINK_BLUE and pymupdf.Rect(s["bbox"]).intersects(rect)]
            underlined = [d for d in page.get_drawings()
                          if abs(d["rect"].y0 - rect.y1) < 4 and d["rect"].x0 >= rect.x0 - 1 and d["rect"].x1 <= rect.x1 + 1]
            status = "ok" if blue and underlined else "NOT STYLED AS A LINK"
            print(f"   link {L.get('uri')} -> {text!r} [{status}]")
            if not (blue and underlined):
                failures.append(f"link style {L.get('uri')}")
        stray = [s for s in spans if s["color"] == LINK_BLUE and s["text"].strip() and not any(pymupdf.Rect(s["bbox"]).intersects(L["from"]) for L in links)]
        for s in stray:
            failures.append(f"blue text without a link: {s['text']!r}")
        all_text.append(page.get_text())
        if png_dir:
            page.get_pixmap(dpi=100).save(f"{png_dir}/page-{i + 1}.png")
    text = "\n".join(all_text)
    for h in HEADINGS:
        spaced = " ".join(h)
        if spaced in text:
            failures.append(f"heading extracts letter-spaced: {h}")
    # Repetition: any sentence-sized fragment (8+ words) appearing twice is a repeated claim.
    words = re.findall(r"[A-Za-z0-9][A-Za-z0-9'/.-]*", text.lower())
    grams = Counter(" ".join(words[i:i + 8]) for i in range(len(words) - 7))
    repeats = [g for g, n in grams.items() if n > 1]
    if repeats:
        print("repeated fragments:")
        for g in repeats[:12]:
            print("   ", g)
        failures.append(f"{len(repeats)} repeated fragments")
    print("RESULT:", "OK" if not failures else "FAIL: " + "; ".join(failures))
    return 0 if not failures else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv))
