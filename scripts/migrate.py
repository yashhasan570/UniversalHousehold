#!/usr/bin/env python3
"""Re-apply the Universal Household rebrand after each upstream sync (idempotent).

Protected anchors (kept intact on every run):
- grocy.info / demo.grocy.info / releases.grocy.info  (upstream site + release URLs)
- github.com/berrnd/...                                (composer VCS fork deps)
- LICENSE.md (untouched)
"""
from pathlib import Path
import shutil

PAIRS = [
 ("GrocycodeImage", "UniversalHouseholdCodeImage"),
 ("Grocycode", "UniversalHouseholdCode"),
 ("grocycodes", "householdcodes"),
 ("grocycode", "householdcode"),
 ("GROCY_", "UNIVERSALHOUSEHOLD_"),
 ("Grocy", "Universal Household"),
 ("GROCY", "UNIVERSALHOUSEHOLD"),
 ("grocy", "universalhousehold"),
 ("Bernd Bestel", "yashhasan570"),
 ("berrnd.de", "github.com/yashhasan570"),
]
PROTECT = ["github.com/berrnd/", "grocy.info", "GNU General Public License"]
SKIP_EXT = {".png",".jpg",".jpeg",".ico",".webp",".woff",".woff2",".ttf",".eot",".otf",".svgz",".mp3",".ogg",".zip",".gz",".pdf"}
KEEP = {"LICENSE.md", "migrate.py", "sync.yml"}
DELETE = ["changelog", "docs/publication_assets", ".github/FUNDING.yml", ".github/CONTRIBUTING.md",
          ".github/ISSUE_TEMPLATE", ".github/PULL_REQUEST_TEMPLATE.md", ".github/SECURITY.md"]
ABOUT_ANCHOR = '<p class="small text-muted border-top pt-3">'
ABOUT_NEW = '''		<p class="small text-muted border-top pt-3">
			Universal Household<br>
			Contact: <a href="https://t.me/johnconstantine570"
				class="text-dark"
				target="_blank">Telegram @johnconstantine570</a><br>
		</p>'''


def sweep_text(t):
    out = []
    for line in t.splitlines(keepends=True):
        if any(p.lower() in line.lower() for p in PROTECT):
            out.append(line); continue
        for a, b in PAIRS:
            line = line.replace(a, b)
        out.append(line)
    return "".join(out)


def main():
    root = Path(".")
    for d in DELETE:
        p = Path(d)
        if p.is_dir():
            shutil.rmtree(p, ignore_errors=True)
        elif p.exists():
            p.unlink()
    for p in root.rglob("*"):
        if ".git" in p.parts or not p.is_file():
            continue
        if p.name in KEEP or p.suffix in SKIP_EXT:
            continue
        try:
            t = p.read_text()
        except Exception:
            continue
        nt = sweep_text(t)
        if nt != t:
            p.write_text(nt)
    # rename files still carrying upstream names
    for p in list(root.rglob("*grocy*")) + list(root.rglob("*Grocy*")):
        if ".git" in p.parts or p.is_dir():
            continue
        nb = p.name
        for a, b in [("Grocycode", "UniversalHouseholdCode"), ("grocycode", "householdcode"),
                     ("grocy", "universalhousehold"), ("Grocy", "UniversalHousehold")]:
            nb = nb.replace(a, b)
        if nb != p.name:
            p.rename(p.with_name(nb))
    # about-page contact block
    about = Path("views/about.blade.php")
    if about.exists():
        t = about.read_text()
        if "t.me/johnconstantine570" not in t:
            i = t.find(ABOUT_ANCHOR)
            if i != -1:
                j = t.find("</p>", i) + len("</p>")
                t = t[:i] + ABOUT_NEW + t[j:]
                about.write_text(t)
    # README back to plain product wording
    readme = Path("README.md")
    want = "# Universal Household\n"
    if readme.exists() and not readme.read_text().startswith(want):
        print("README drifted - rewrite needed")
    n = 0
    print("migrate done")


if __name__ == "__main__":
    main()
