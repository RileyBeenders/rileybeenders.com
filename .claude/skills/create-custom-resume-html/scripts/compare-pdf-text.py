"""Compare two PDFs page by page: same page count, same extracted text on every page.

    python compare-pdf-text.py <printed.pdf> <delivered.pdf>

Used by verify-web-resume.mjs to prove the HTML resume's print matches the validated PDF.
Exit 0 when identical, 1 otherwise. Needs pymupdf (the same dependency as validate-resume.py).
"""
import sys

import pymupdf


def pages(path):
    with pymupdf.open(path) as doc:
        return [" ".join(page.get_text().split()) for page in doc]


def main():
    if len(sys.argv) != 3:
        print(__doc__)
        return 2
    a, b = pages(sys.argv[1]), pages(sys.argv[2])
    if len(a) != len(b):
        print(f"     page count differs: printed {len(a)}, delivered {len(b)}")
        return 1
    bad = [i + 1 for i, (x, y) in enumerate(zip(a, b)) if x != y]
    for n in bad:
        x, y = a[n - 1], b[n - 1]
        at = next((i for i, (p, q) in enumerate(zip(x, y)) if p != q), min(len(x), len(y)))
        print(f"     page {n} differs near: printed ...{x[max(0, at - 40):at + 40]!r} / delivered ...{y[max(0, at - 40):at + 40]!r}")
    if not bad:
        print(f"     {len(a)} page(s), identical text on every page")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
