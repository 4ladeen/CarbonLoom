"""Update CarbonLoom logo mark and favicons across all HTML files.
"""

from pathlib import Path
import re

LOGO_SVG = """<svg width="22" height="22" viewBox="0 0 120 120" fill="none" aria-hidden="true">
            <polygon points="60,14 100,37 100,83 60,106 20,83 20,37" stroke="var(--color-accent)" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"/>
            <line x1="44" y1="28" x2="44" y2="92" stroke="var(--color-text-muted)" stroke-width="4" stroke-linecap="round"/>
            <line x1="60" y1="20" x2="60" y2="100" stroke="var(--color-text-primary)" stroke-width="4" stroke-linecap="round"/>
            <line x1="76" y1="28" x2="76" y2="92" stroke="var(--color-text-muted)" stroke-width="4" stroke-linecap="round"/>
            <path d="M30 46 H90" stroke="var(--color-accent)" stroke-width="4" stroke-linecap="round"/>
            <path d="M26 60 H94" stroke="var(--color-text-primary)" stroke-width="5" stroke-linecap="round"/>
            <path d="M30 74 H90" stroke="var(--color-accent)" stroke-width="4" stroke-linecap="round"/>
            <circle cx="60" cy="60" r="9" fill="var(--color-surface-deep)" stroke="var(--color-accent)" stroke-width="4"/>
            <circle cx="60" cy="60" r="4" fill="var(--color-accent)"/>
          </svg>"""

TARGET_FILES = [
    ("index.html", "favicon.svg"),
    ("architecture.html", "favicon.svg"),
    ("playground.html", "favicon.svg"),
    ("pricing.html", "favicon.svg"),
    ("apps/web/index.html", "../../favicon.svg"),
    ("apps/buyer-portal/index.html", "../../favicon.svg"),
    ("apps/verifier-workspace/index.html", "../../favicon.svg"),
    ("video/index.html", "../favicon.svg"),
]

def update_file(path_str: str, favicon_rel: str):
    p = Path(path_str)
    if not p.exists():
        print(f"Skipping {path_str} (not found)")
        return
        
    content = p.read_text(encoding="utf-8")
    
    # 1. Add favicon if missing
    if "rel=\"icon\"" not in content and 'rel="icon"' not in content:
        content = content.replace("<head>", f'<head>\n  <link rel="icon" type="image/svg+xml" href="{favicon_rel}">', 1)

    # 2. Pattern for old mark in index, architecture, playground, pricing
    old_pattern = re.compile(
        r'<div class="brand-mark">\s*<!--[^>]*-->\s*<svg[^>]*>.*?</svg>\s*</div>',
        re.DOTALL
    )
    if old_pattern.search(content):
        content = old_pattern.sub(f'<div class="brand-mark">\n          {LOGO_SVG}\n        </div>', content)
        print(f"Updated brand-mark in {path_str}")
    else:
        # Check if brand-mark exists with any svg inside
        brand_mark_pat = re.compile(r'<div class="brand-mark">\s*<svg[^>]*>.*?</svg>\s*</div>', re.DOTALL)
        if brand_mark_pat.search(content):
            content = brand_mark_pat.sub(f'<div class="brand-mark">\n          {LOGO_SVG}\n        </div>', content)
            print(f"Updated generic brand-mark in {path_str}")

    p.write_text(content, encoding="utf-8")

def main():
    for fn, fav in TARGET_FILES:
        update_file(fn, fav)
    print("Logo and favicon integration complete.")

if __name__ == "__main__":
    main()
