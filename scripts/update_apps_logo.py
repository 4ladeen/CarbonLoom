"""Update logo mark in apps/web, apps/verifier-workspace, and video.
"""

from pathlib import Path
import re

LOGO_INNER = """<svg width="20" height="20" viewBox="0 0 120 120" fill="none" aria-hidden="true">
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

def update_web():
    p = Path("apps/web/index.html")
    content = p.read_text(encoding="utf-8")
    
    # Replace brand-symbol svg
    pat = re.compile(r'<div class="brand-symbol">\s*<svg[^>]*>.*?</svg>\s*</div>', re.DOTALL)
    if pat.search(content):
        content = pat.sub(f'<div class="brand-symbol">\n            {LOGO_INNER}\n          </div>', content)
        print("Updated apps/web/index.html logo")
    p.write_text(content, encoding="utf-8")

def update_verifier():
    p = Path("apps/verifier-workspace/index.html")
    content = p.read_text(encoding="utf-8")
    if "Return to Platform Overview" in content and "brand-icon" not in content:
        # Prepend logo mark before title
        replacement = f'''<div style="display: flex; align-items: center; gap: var(--space-3); margin-bottom: 4px;">
          <div style="width: 28px; height: 28px; border-radius: var(--radius-inner); background: var(--color-surface-raised); border: 1px solid var(--color-surface-border); display: flex; align-items: center; justify-content: center;">
            {LOGO_INNER}
          </div>
          <h1 style="font-size: 20px; font-weight: 600; letter-spacing: -0.02em; margin: 0; color: var(--color-text-primary);">
            NRB Certified Auditor Workspace (FR-F4)
          </h1>
        </div>'''
        content = re.sub(r'<h1 style="font-size: 20px;[^>]*>.*?</h1>', replacement, content, count=1, flags=re.DOTALL)
        print("Updated apps/verifier-workspace/index.html logo")
    p.write_text(content, encoding="utf-8")

def update_video():
    p = Path("video/index.html")
    content = p.read_text(encoding="utf-8")
    if "brand-title" in content and "brand-icon" not in content:
        content = content.replace(
            '<h1 class="brand-title">',
            f'<div style="display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-1);"><div style="width: 28px; height: 28px; border-radius: var(--radius-inner); background: var(--color-surface-raised); border: 1px solid var(--color-surface-border); display: flex; align-items: center; justify-content: center;">{LOGO_INNER}</div><h1 class="brand-title" style="margin: 0;">'
        ).replace('</h1>', '</h1></div>', 1)
        print("Updated video/index.html logo")
    p.write_text(content, encoding="utf-8")

if __name__ == "__main__":
    update_web()
    update_verifier()
    update_video()
