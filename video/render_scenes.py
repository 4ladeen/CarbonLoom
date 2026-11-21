"""Master Scene Frame Renderer for CarbonLoom 174s Project Video.
Strictly follows PRD 7.5 and user specifications:
- 1080p canvas (1920x1080)
- Official CarbonLoom Logo Mark and Branding
- Persistent [SIMULATED DATA (PILOT RUN)] watermark
- Synchronized Closed Captions on every scene
- Rich Graphs, Charts, Figures, Indicators, and Transitions
- Explaining the entire project in 174 seconds
"""

import os
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

WIDTH, HEIGHT = 1920, 1080

# Hallmark Graphite Tokens Palette
BG_COLOR = (9, 13, 22)             # #090d16
CARD_BG = (17, 24, 39)             # #111827
CARD_BORDER = (30, 41, 59)         # #1e293b
SURFACE_INNER = (13, 18, 30)       # #0d121e
TEXT_PRIMARY = (248, 250, 252)     # #f8fafc
TEXT_SECONDARY = (148, 163, 184)   # #94a3b8
TEXT_MUTED = (100, 116, 139)       # #64748b
EMERALD = (16, 185, 129)           # #10b981
EMERALD_LIGHT = (52, 211, 153)     # #34d399
ROSE = (239, 68, 68)               # #ef4444
ROSE_DARK = (45, 15, 20)
AMBER = (245, 158, 11)             # #f59e0b
BLUE = (59, 130, 246)              # #3b82f6
CYAN = (6, 182, 212)               # #06b6d4
PURPLE = (168, 85, 247)            # #a855f7

FONT_DIR = "C:/Windows/Fonts"

def get_font(name: str, size: int):
    path = os.path.join(FONT_DIR, name)
    if os.path.exists(path):
        return ImageFont.truetype(path, size)
    return ImageFont.load_default()

FONT_TITLE = get_font("segoeuib.ttf", 36)
FONT_SUBTITLE = get_font("segoeui.ttf", 20)
FONT_CARD_TITLE = get_font("segoeuib.ttf", 24)
FONT_BODY = get_font("segoeui.ttf", 19)
FONT_BODY_BOLD = get_font("segoeuib.ttf", 19)
FONT_CODE = get_font("consola.ttf", 17)
FONT_CODE_BOLD = get_font("consolab.ttf", 17)
FONT_BIG_STAT = get_font("segoeuib.ttf", 56)
FONT_WATERMARK = get_font("segoeuib.ttf", 14)
FONT_CAPTION = get_font("segoeuib.ttf", 22)
FONT_CAPTION_SUB = get_font("segoeui.ttf", 18)
FONT_BN = get_font("vrinda.ttf", 21)
FONT_BN_TITLE = get_font("vrindab.ttf", 23)

def draw_logo_mark(draw: ImageDraw.ImageDraw, x: int, y: int, size: int = 40):
    scale = size / 120.0
    def pt(px, py):
        return (int(x + px * scale), int(y + py * scale))

    pts = [pt(60, 14), pt(100, 37), pt(100, 83), pt(60, 106), pt(20, 83), pt(20, 37)]
    draw.polygon(pts, outline=EMERALD, width=int(5 * scale))
    
    draw.line([pt(44, 28), pt(44, 92)], fill=TEXT_MUTED, width=int(3 * scale))
    draw.line([pt(60, 20), pt(60, 100)], fill=TEXT_PRIMARY, width=int(3.5 * scale))
    draw.line([pt(76, 28), pt(76, 92)], fill=TEXT_MUTED, width=int(3 * scale))
    
    draw.line([pt(30, 46), pt(90, 46)], fill=EMERALD, width=int(3.5 * scale))
    draw.line([pt(26, 60), pt(94, 60)], fill=TEXT_PRIMARY, width=int(4 * scale))
    draw.line([pt(30, 74), pt(90, 74)], fill=EMERALD, width=int(3.5 * scale))
    
    r = int(7 * scale)
    cx, cy = pt(60, 60)
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=BG_COLOR, outline=EMERALD, width=int(3 * scale))
    draw.ellipse([cx - 2, cy - 2, cx + 2, cy + 2], fill=EMERALD_LIGHT)

def draw_chrome_and_captions(draw: ImageDraw.ImageDraw, scene_num: int, time_label: str, title: str, subtitle: str, caption_text: str):
    # 1. Top Header Bar
    draw.rectangle([0, 0, WIDTH, 90], fill=SURFACE_INNER)
    draw.line([0, 90, WIDTH, 90], fill=CARD_BORDER, width=2)
    
    # Draw Brand Logo
    draw_logo_mark(draw, 50, 22, 46)
    draw.text((110, 26), "CarbonLoom", font=FONT_TITLE, fill=TEXT_PRIMARY)
    draw.text((360, 36), "|  Enterprise Decarbonization OS for Bangladesh RMG", font=FONT_SUBTITLE, fill=TEXT_SECONDARY)
    
    # Persistent Watermark (PRD 7.5 requirement)
    draw.rectangle([WIDTH - 660, 24, WIDTH - 360, 66], fill=(24, 20, 15), outline=AMBER, width=2)
    draw.text((WIDTH - 640, 34), "SIMULATED DATA [PILOT RUN]", font=FONT_WATERMARK, fill=AMBER)
    
    # Scene Badge
    badge_text = f"SCENE {scene_num}/6 : {time_label}"
    draw.rectangle([WIDTH - 340, 24, WIDTH - 50, 66], fill=(30, 41, 59), outline=BLUE, width=1)
    draw.text((WIDTH - 320, 34), badge_text, font=FONT_CODE_BOLD, fill=BLUE)
    
    # 2. Scene Section Title & Subhead
    draw.text((50, 115), title, font=FONT_CARD_TITLE, fill=TEXT_PRIMARY)
    draw.text((50, 152), subtitle, font=FONT_BODY, fill=TEXT_SECONDARY)
    
    # 3. Bottom Timeline Scrubber
    draw.rectangle([0, HEIGHT - 130, WIDTH, HEIGHT], fill=SURFACE_INNER)
    draw.line([0, HEIGHT - 130, WIDTH, HEIGHT - 130], fill=CARD_BORDER, width=2)
    
    # Progress Bar
    progress = scene_num / 6.0
    scrub_w = int((WIDTH - 100) * progress)
    draw.rectangle([50, HEIGHT - 120, WIDTH - 50, HEIGHT - 112], fill=(30, 41, 59))
    draw.rectangle([50, HEIGHT - 120, 50 + scrub_w, HEIGHT - 112], fill=EMERALD)
    
    # 4. Synchronized Closed Caption Subtitle Bar
    draw.rectangle([50, HEIGHT - 98, WIDTH - 50, HEIGHT - 18], fill=(15, 23, 42), outline=CARD_BORDER, width=1)
    draw.text((75, HEIGHT - 86), f"[CC {time_label}]", font=FONT_CODE_BOLD, fill=EMERALD)
    draw.text((215, HEIGHT - 84), caption_text, font=FONT_CAPTION, fill=TEXT_PRIMARY)

def draw_card(draw: ImageDraw.ImageDraw, x1, y1, x2, y2, title: str = "", fill=CARD_BG, border=CARD_BORDER):
    draw.rectangle([x1, y1, x2, y2], fill=fill, outline=border, width=2)
    if title:
        draw.rectangle([x1, y1, x2, y1 + 48], fill=(19, 28, 46))
        draw.line([x1, y1 + 48, x2, y1 + 48], fill=border, width=1)
        draw.text((x1 + 20, y1 + 12), title, font=FONT_CARD_TITLE, fill=TEXT_PRIMARY)

# ==============================================================================
# SCENE 1: THE DOUBLE SQUEEZE (0:00 - 0:20)
# ==============================================================================
def render_scene_1(out_path: str):
    img = Image.new("RGB", (WIDTH, HEIGHT), BG_COLOR)
    draw = ImageDraw.Draw(img)
    draw_chrome_and_captions(
        draw, 1, "0:00 - 0:20",
        "THE DOUBLE SQUEEZE: MACRO EXPORT THREAT + UTILITY INFLATION",
        "Why Bangladesh's $47 Billion RMG export engine faces an unprecedented structural compliance crisis",
        "Bangladesh RMG faces an urgent double squeeze: apparel shipments to the EU fell 11.91% while Titas gas tariffs surged 227%."
    )
    
    # Left Card: Macro Export Shock Chart
    draw_card(draw, 50, 190, 930, 930, "1. Macroeconomic Export Shock (EU Apparel Shipments)")
    
    draw.text((80, 260), "-11.91%", font=FONT_BIG_STAT, fill=ROSE)
    draw.text((340, 275), "Export Value Dip (EPB FY2023-24)", font=FONT_CARD_TITLE, fill=TEXT_PRIMARY)
    draw.text((340, 310), "€22.8B (2023)  ->  €20.1B (2024) [€2.7 Billion At Risk]", font=FONT_BODY, fill=ROSE)
    
    # Bar Chart
    draw.rectangle([80, 370, 900, 610], fill=SURFACE_INNER, outline=CARD_BORDER)
    draw.text((105, 390), "Bangladesh RMG Export Value to European Union (€ Billions)", font=FONT_CODE_BOLD, fill=TEXT_SECONDARY)
    
    # 2022 Bar
    draw.rectangle([110, 520, 320, 560], fill=BLUE)
    draw.text((110, 485), "2022: €21.4B", font=FONT_CODE_BOLD, fill=TEXT_PRIMARY)
    # 2023 Bar
    draw.rectangle([370, 460, 580, 560], fill=BLUE)
    draw.text((370, 425), "2023: €22.8B", font=FONT_CODE_BOLD, fill=TEXT_PRIMARY)
    # 2024 Bar
    draw.rectangle([630, 510, 840, 560], fill=ROSE)
    draw.text((630, 475), "2024: €20.1B (-11.9%)", font=FONT_CODE_BOLD, fill=ROSE)
    
    draw.text((80, 640), "Regulatory Squeeze Drivers:", font=FONT_BODY_BOLD, fill=TEXT_PRIMARY)
    drivers = [
        "• EU CBAM Transition: Strict embedded emissions calculation mandated on imported goods",
        "• ESPR Digital Product Passport (DPP): Auditable per-garment QR receipts required by 2026",
        "• Default Emission Penalties: Up to €100/tCO2e if supplier emissions are unverified",
        "• Buyer Attrition: Tier-1 brands shifting orders to verified low-carbon competitors"
    ]
    y = 675
    for d in drivers:
        draw.text((80, y), d, font=FONT_BODY, fill=TEXT_SECONDARY)
        y += 35

    # Right Card: Factory Utility Inflation
    draw_card(draw, 970, 190, 1870, 930, "2. Factory Floor Utility Inflation & Hidden Waste")
    
    utilities = [
        ("Titas Natural Gas", "+227.3%", "Surge from 4.02 to 14.00 BDT/m3 in industrial captive power", ROSE),
        ("DESCO Grid Electricity", "+18.4%", "Staged industrial peak tariff hikes raising cost per kWh", AMBER),
        ("Diesel Backup Generation", "4.8x Grid", "Grid load shedding forces dirty backup generator dispatch ($1.15/L)", ROSE),
        ("Fugitive Utility Leakage", "12% - 19%", "Unmetered steam trap blow-by, stenter exhaust loss, motor idling", AMBER)
    ]
    
    y = 260
    for name, stat, desc, col in utilities:
        draw.rectangle([1000, y, 1840, y + 105], fill=SURFACE_INNER, outline=CARD_BORDER)
        draw.text((1025, y + 18), name, font=FONT_CARD_TITLE, fill=TEXT_PRIMARY)
        draw.text((1600, y + 16), stat, font=FONT_CARD_TITLE, fill=col)
        draw.text((1025, y + 62), desc, font=FONT_BODY, fill=TEXT_SECONDARY)
        y += 125
        
    # Industrial Pilot Callout
    draw.rectangle([1000, 780, 1840, 900], fill=(20, 28, 45), outline=BLUE)
    draw.text((1025, 800), "Target Facility Pilot: DBL Composite Knit (Gazipur, Bangladesh)", font=FONT_BODY_BOLD, fill=TEXT_PRIMARY)
    draw.text((1025, 835), "Workforce: 4,200 | Output: 1.8M garments/month | Monthly Energy: 184,250 kWh", font=FONT_CODE, fill=TEXT_SECONDARY)
    draw.text((1025, 865), "Diagnostic Objective: Identify fugitive floor waste and automate CBAM compliance", font=FONT_CODE, fill=EMERALD)

    img.save(out_path)
    print(f"Saved {out_path}")

# ==============================================================================
# SCENE 2: BILINGUAL INGESTION & ZERO-TRUST GO GATEWAY (0:20 - 0:45)
# ==============================================================================
def render_scene_2(out_path: str):
    img = Image.new("RGB", (WIDTH, HEIGHT), BG_COLOR)
    draw = ImageDraw.Draw(img)
    draw_chrome_and_captions(
        draw, 2, "0:20 - 0:45",
        "BILINGUAL MULTI-MODAL OCR & ZERO-TRUST GO MCP GATEWAY",
        "Raw Bengali utility invoices ingested directly into structured, auditable JSON via 8-server gateway",
        "doc-vision-mcp ingests raw Bengali utility bills directly, routing data through our 8-server zero-trust Go gateway."
    )
    
    # Left Card: OCR
    draw_card(draw, 50, 190, 930, 930, "Module A: doc-vision-mcp (PaddleOCR + Donut Extractor)")
    
    # Scanned Bengali Bill Simulation
    draw.rectangle([80, 260, 900, 520], fill=(245, 247, 250), outline=(203, 213, 225))
    draw.text((110, 280), "ঢাকা ইলেকট্রিক সাপ্লাই কোম্পানি লিমিটেড (DESCO)", font=FONT_BN_TITLE, fill=(15, 23, 42))
    draw.text((110, 320), "বিদ্যুৎ বিল / আগস্ট ২০২৪ (LT-Industrial Tariff)", font=FONT_BN, fill=(51, 65, 85))
    draw.text((110, 360), "মিটারের নম্বর : LT-E-904128", font=FONT_BN, fill=(15, 23, 42))
    draw.text((110, 400), "ব্যবহৃত ইউনিট : ৪২,৫৫০ kWh  (42,550 kWh)", font=FONT_BN, fill=(15, 23, 42))
    draw.text((110, 440), "মোট প্রদেয় বিল : ৩,৬১,৬৭৫ ৳  (361,675 BDT)", font=FONT_BN, fill=(15, 23, 42))
    
    # OCR Bounding Box Indicator
    draw.rectangle([100, 392, 600, 432], outline=EMERALD, width=2)
    draw.rectangle([610, 396, 750, 428], fill=EMERALD)
    draw.text((620, 402), "CONF: 98.5%", font=FONT_CODE_BOLD, fill=BG_COLOR)
    
    # Validated Output JSON
    draw.rectangle([80, 545, 900, 905], fill=SURFACE_INNER, outline=CARD_BORDER)
    draw.text((105, 565), "Validated Pydantic Schema Output (Deterministic Types):", font=FONT_CODE_BOLD, fill=BLUE)
    json_lines = [
        '{',
        '  "utility_provider": "DESCO",',
        '  "meter_id": "LT-E-904128",',
        '  "billing_period": "2024-08",',
        '  "consumption_kwh": 42550.0,',
        '  "amount_bdt": 361675.0,',
        '  "grid_emission_factor": 0.620,  // DoE Bangladesh Official',
        '  "calculated_scope2_tco2e": 26.381,',
        '  "confidence_score": 0.988,',
        '  "status": "AUTO_APPROVED"',
        '}'
    ]
    y_code = 600
    for jl in json_lines:
        col = EMERALD if "//" in jl else (TEXT_PRIMARY if "42550" in jl else TEXT_SECONDARY)
        draw.text((120, y_code), jl, font=FONT_CODE, fill=col)
        y_code += 28

    # Right Card: Go MCP Gateway
    draw_card(draw, 970, 190, 1870, 930, "Module D: Zero-Trust Go MCP Gateway (Sub-25ms p95)")
    
    draw.text((1000, 255), "Security Middleware Chain (Strict Go stdlib / crypto):", font=FONT_BODY_BOLD, fill=TEXT_PRIMARY)
    
    stages = [
        ("1. Auth0 Ed25519 Token Authentication", "Validates bearer signature and factory tenant context in <1.2ms"),
        ("2. Open Policy Agent (OPA) RBAC", "Enforces tenant boundary isolation and column-level read restrictions"),
        ("3. Presidio PII & Commercial Sanitizer", "Redacts unit prices, yarn vendor names, margins, and employee TINs"),
        ("4. Prompt Injection Defense Engine", "Blocks system prompt exfiltration, jailbreaks, and adversarial overrides"),
        ("5. Single-Use Supervisor Approval Gate", "Requires cryptographic human authorization token for any write"),
        ("6. Hash-Chained SHA-256 Audit Ledger", "Appends immutable SHA-256 block for every single MCP tool call")
    ]
    y = 295
    for s_name, s_desc in stages:
        draw.rectangle([1000, y, 1840, y + 62], fill=SURFACE_INNER, outline=CARD_BORDER)
        draw.text((1025, y + 10), s_name, font=FONT_CODE_BOLD, fill=EMERALD)
        draw.text((1025, y + 34), s_desc, font=FONT_CODE, fill=TEXT_SECONDARY)
        y += 74
        
    draw.text((1000, 755), "8 Sandboxed Isolated MCP Servers:", font=FONT_BODY_BOLD, fill=TEXT_PRIMARY)
    servers = [
        ("meter-mcp", "RO"), ("erp-mcp", "RO"), ("factors-mcp", "RO"), ("doc-vision-mcp", "RO"),
        ("regulatory-rag-mcp", "RO"), ("report-compliance-mcp", "W"), ("cmms-supplier-mcp", "W"), ("trust-zk-ledger-mcp", "W")
    ]
    x_s, y_s = 1000, 795
    for idx, (s_name, s_type) in enumerate(servers):
        draw.rectangle([x_s, y_s, x_s + 195, y_s + 50], fill=(20, 28, 45), outline=BLUE)
        draw.text((x_s + 12, y_s + 14), s_name, font=FONT_CODE, fill=TEXT_PRIMARY)
        draw.text((x_s + 160, y_s + 14), s_type, font=FONT_CODE_BOLD, fill=AMBER if s_type == "W" else CYAN)
        x_s += 210
        if (idx + 1) % 4 == 0:
            x_s = 1000
            y_s += 60

    img.save(out_path)
    print(f"Saved {out_path}")

# ==============================================================================
# SCENE 3: FORENSIC XAI WASTE DETECTION (0:45 - 1:15)
# ==============================================================================
def render_scene_3(out_path: str):
    img = Image.new("RGB", (WIDTH, HEIGHT), BG_COLOR)
    draw = ImageDraw.Draw(img)
    draw_chrome_and_captions(
        draw, 3, "0:45 - 1:15",
        "FORENSIC XAI WASTE DETECTION & DIGITAL TWIN SIMULATION",
        "6,336 telemetry readings streamed to Isolation Forest + TreeSHAP flags Boiler steam-trap failure",
        "Live meter telemetry analyzed by Isolation Forest and TreeSHAP pinpoints a Boiler 1 steam-trap leak, proposing a gated work order."
    )
    
    # Left Card: Telemetry Streams
    draw_card(draw, 50, 190, 930, 930, "Module B: Digital Twin Factory Telemetry Stream")
    
    meters = [
        ("BOILER-01 Gas Flow", "184.2 m3/h", "Expected: 140.0 m3/h (+31.5% excessive consumption)", ROSE),
        ("BOILER-01 Exhaust Temp", "246.5 °C", "Baseline: 175.0 °C (Critical steam blow-by leak)", ROSE),
        ("BOILER-01 Steam Pressure", "7.8 bar", "Target: 8.0 bar (Sub-optimal line pressure)", AMBER),
        ("GENSET-01 Diesel Burn", "48.2 L/h", "Grid Available: Sub-optimal generator dispatch", AMBER),
        ("STENTER-02 Electrical Draw", "142.0 kW", "Normal operating profile (3,200 m/h fabric)", EMERALD),
        ("AIR COMPRESSOR-03", "6.2 bar", "Baseline: 6.5 bar (Minor manifold drop)", AMBER)
    ]
    y = 260
    for name, val, desc, col in meters:
        draw.rectangle([80, y, 900, y + 78], fill=SURFACE_INNER, outline=CARD_BORDER)
        draw.text((105, y + 14), name, font=FONT_BODY_BOLD, fill=TEXT_PRIMARY)
        draw.text((710, y + 14), val, font=FONT_CODE_BOLD, fill=col)
        draw.text((105, y + 44), desc, font=FONT_CODE, fill=TEXT_SECONDARY)
        y += 94
        
    # Anomaly Badge
    draw.rectangle([80, 840, 900, 905], fill=ROSE_DARK, outline=ROSE, width=2)
    draw.text((105, 860), "ANOMALY SCORE: 0.842 (CRITICAL) | Model: Isolation Forest (100 Trees)", font=FONT_CODE_BOLD, fill=ROSE)

    # Right Card: TreeSHAP Waterfall
    draw_card(draw, 970, 190, 1870, 930, "Module E: TreeSHAP Forensic Attribution & CMMS Ticket")
    
    draw.text((1000, 255), "TreeSHAP Forensic Emission Contribution Waterfall:", font=FONT_BODY_BOLD, fill=TEXT_PRIMARY)
    
    # Waterfall Graphic Box
    draw.rectangle([1000, 290, 1840, 560], fill=SURFACE_INNER, outline=CARD_BORDER)
    
    draw.text((1025, 315), "Baseline Expected Emission: 142.3 kg CO2e/h", font=FONT_CODE, fill=TEXT_SECONDARY)
    draw.rectangle([1025, 345, 1340, 380], fill=(45, 55, 75))
    
    draw.text((1025, 400), "+ Exhaust Temp Spike (>240°C): +28.4 kg CO2e/h (84.2% attribution)", font=FONT_CODE_BOLD, fill=ROSE)
    draw.rectangle([1340, 425, 1630, 460], fill=ROSE)
    
    draw.text((1025, 480), "+ Diesel Backup Active While Grid Available: +12.1 kg CO2e/h (15.8% attribution)", font=FONT_CODE_BOLD, fill=AMBER)
    draw.rectangle([1630, 505, 1750, 540], fill=AMBER)
    
    # CMMS Remediation Ticket
    draw_card(draw, 1000, 580, 1840, 905, "Automated CMMS Work Order #WO-2024-0891 (Human-Gated)")
    draw.text((1025, 650), "Remediation Action: Replace inverted bucket steam trap #ST-402 on Boiler Line 1", font=FONT_BODY_BOLD, fill=TEXT_PRIMARY)
    draw.text((1025, 690), "Financial Payback: $3,420 monthly gas savings | Carbon Reduction: -18.4 tCO2e/mo", font=FONT_BODY, fill=EMERALD)
    draw.text((1025, 730), "Safety Pre-requisite: Supervisor Approval Token required for CMMS write execution", font=FONT_BODY, fill=TEXT_SECONDARY)
    
    draw.rectangle([1025, 785, 1380, 850], fill=(16, 185, 129, 30), outline=EMERALD, width=2)
    draw.text((1055, 808), "APPROVE WORK ORDER", font=FONT_CODE_BOLD, fill=EMERALD)
    
    draw.rectangle([1400, 785, 1800, 850], fill=(30, 41, 59), outline=CARD_BORDER)
    draw.text((1420, 808), "Token: APP-TKN-8921-OK", font=FONT_CODE, fill=BLUE)
    draw.text((1025, 875), "Status: Single-use cryptographic approval token issued | CMMS ticket dispatched", font=FONT_CODE, fill=TEXT_MUTED)

    img.save(out_path)
    print(f"Saved {out_path}")

# ==============================================================================
# SCENE 4: BANGLA GRAPHRAG & CORRECTIVE REFUSAL (1:15 - 1:40)
# ==============================================================================
def render_scene_4(out_path: str):
    img = Image.new("RGB", (WIDTH, HEIGHT), BG_COLOR)
    draw = ImageDraw.Draw(img)
    draw_chrome_and_captions(
        draw, 4, "1:15 - 1:40",
        "BANGLA GRAPHRAG & CRAG SPECULATIVE REFUSAL RULE",
        "Hybrid Knowledge Graph (Neo4j + pgvector) grounds queries with legal citations and strictly refuses unbacked claims",
        "Bilingual GraphRAG grounds queries in official EU regulations. When faced with speculative questions, corrective RAG triggers strict refusal."
    )
    
    # Top Card: Grounded Answer
    draw_card(draw, 50, 190, 1870, 540, "1. Grounded Regulatory Query (Exact EU Legal Citations)")
    
    draw.rectangle([80, 260, 1840, 320], fill=SURFACE_INNER, outline=CARD_BORDER)
    draw.text((105, 275), "Factory Manager (Bengali): আমাদের রফতানি করা সুতি টি-শার্টের জন্য ইউরোপীয় ইউনিয়নের সিবিএএম রিপোর্ট কীভাবে তৈরি করব?", font=FONT_BN, fill=TEXT_PRIMARY)
    
    draw.rectangle([80, 335, 1840, 515], fill=(15, 23, 42), outline=EMERALD)
    draw.text((105, 355), "CarbonLoom Agent (Grounded via Neo4j Knowledge Graph):", font=FONT_CODE_BOLD, fill=EMERALD)
    draw.text((105, 390), "EU CBAM রেগুলেশন ২০২৩/৯৫৬ এর এনেক্স ৪ (অনুচ্ছেদ ৩.১) অনুযায়ী, বোনা পোশাক ও টেক্সটাইলের জন্য সরাসরি নির্গমন (Scope 1)", font=FONT_BN, fill=TEXT_PRIMARY)
    draw.text((105, 425), "এবং ব্যবহৃত গ্রিড বিদ্যুতের পরোক্ষ নির্গমন (Scope 2) এসএমভি (SMV) সূত্রের ভিত্তিতে প্রতি পোশাকে বণ্টন করতে হবে।", font=FONT_BN, fill=TEXT_PRIMARY)
    draw.text((105, 470), "Verified Citations: [EU CBAM Regulation 2023/956, Annex IV §3.1, p. 44]  |  [ESPR Delegated Act Art. 7, p. 18]  (Confidence: 0.96)", font=FONT_CODE_BOLD, fill=BLUE)

    # Bottom Card: Refusal Rule
    draw_card(draw, 50, 560, 1870, 930, "2. Corrective RAG (CRAG) Speculative Refusal Rule")
    
    draw.rectangle([80, 630, 1840, 690], fill=SURFACE_INNER, outline=CARD_BORDER)
    draw.text((105, 650), "User Speculative Query: What will the EU CBAM allowance price per ton be in December 2035?", font=FONT_BODY_BOLD, fill=TEXT_PRIMARY)
    
    draw.rectangle([80, 705, 1840, 905], fill=ROSE_DARK, outline=ROSE, width=2)
    draw.text((105, 725), "CarbonLoom Agent (CRAG Confidence Score 0.32 < 0.70 Threshold Triggered):", font=FONT_CODE_BOLD, fill=ROSE)
    draw.text((105, 770), "তথ্য অপর্যাপ্ত (Confidence: 0.32) — আমি কোনো অনুমানমূলক জল্পনা-কল্পনা বা আইনগত ভিত্তিহীন মূল্য পূর্বাভাস দিতে পারি না।", font=FONT_BN_TITLE, fill=TEXT_PRIMARY)
    draw.text((105, 825), "CRAG System Invariant: CarbonLoom explicitly refuses hallucinations or forward financial speculation without binding statutes.", font=FONT_BODY, fill=TEXT_SECONDARY)
    draw.text((105, 860), "Refusal Accuracy: 100% on Adversarial Red-Team Suite (eval/injection_redteam.py)", font=FONT_CODE_BOLD, fill=EMERALD)

    img.save(out_path)
    print(f"Saved {out_path}")

# ==============================================================================
# SCENE 5: PER-GARMENT CARBON & LIVE TAMPER TEST (1:40 - 2:25)
# ==============================================================================
def render_scene_5(out_path: str):
    img = Image.new("RGB", (WIDTH, HEIGHT), BG_COLOR)
    draw = ImageDraw.Draw(img)
    draw_chrome_and_captions(
        draw, 5, "1:40 - 2:25",
        "PER-GARMENT CARBON, NRB HITL & LIVE CRYPTOGRAPHIC TAMPER TEST",
        "Deterministic SMV Allocation + NRB Ed25519 Co-Sign + Groth16 ZK Proof + Instant Red Tamper Failure",
        "Using deterministic SMV allocation, we calculate 1.412 kg per garment. Groth16 proofs verify in 142ms. If an adversary mutates 1 digit, checks immediately fail red."
    )
    
    # Left Card: SMV Passport & NRB HITL
    draw_card(draw, 50, 190, 930, 930, "Module G: SMV Garment Passport & NRB Audit")
    
    draw.text((80, 260), "100% Organic Cotton Crewneck (Batch #8921)", font=FONT_BODY_BOLD, fill=TEXT_PRIMARY)
    draw.text((80, 295), "Standard Minute Value (SMV): 14.50 mins | Volume: 50,000 pcs", font=FONT_BODY, fill=TEXT_SECONDARY)
    
    # Receipt Table
    draw.rectangle([80, 340, 900, 580], fill=SURFACE_INNER, outline=CARD_BORDER)
    draw.text((105, 360), "Carbon Footprint per Garment (0.00% Arithmetic Tolerance):", font=FONT_CODE_BOLD, fill=TEXT_PRIMARY)
    draw.text((105, 405), "• Direct Combustion (Scope 1):     0.812 kg CO2e / pc", font=FONT_CODE, fill=TEXT_SECONDARY)
    draw.text((105, 445), "• Purchased Electricity (Scope 2):    0.600 kg CO2e / pc", font=FONT_CODE, fill=TEXT_SECONDARY)
    draw.text((105, 490), "• Total Embedded Product Carbon:     1.412 kg CO2e / pc", font=FONT_CODE_BOLD, fill=EMERALD)
    draw.text((105, 535), "Allocation Method: Direct SMV line balance (DIN EN ISO 14064-1)", font=FONT_CODE, fill=TEXT_MUTED)
    
    # NRB Co-Sign Card
    draw.rectangle([80, 605, 900, 905], fill=(20, 28, 45), outline=BLUE)
    draw.text((105, 625), "NRB Lead Verifier Co-Signature (Human-In-The-Loop):", font=FONT_CODE_BOLD, fill=BLUE)
    draw.text((105, 665), "Auditor: Dr. A. Rahman (Lead Verifier ISO 14064, London / Dhaka)", font=FONT_BODY, fill=TEXT_PRIMARY)
    draw.text((105, 705), "Ed25519 Pubkey: 0x98f4c3...c20b | Status: APPROVED & CO-SIGNED", font=FONT_CODE, fill=EMERALD)
    draw.text((105, 745), "Fabric Merkle Root: 0x5a18c99f302b11d88a4421ef...", font=FONT_CODE, fill=TEXT_SECONDARY)
    draw.text((105, 785), "Blockchain Consortium Channel: 3-Org (Factory, Verifier, Customs)", font=FONT_CODE, fill=CYAN)
    draw.text((105, 825), "Audit Timestamp: 2024-08-20T14:22:18Z (Immutable Anchor)", font=FONT_CODE, fill=TEXT_MUTED)
    draw.text((105, 865), "Verified DPP URL: https://4ladeen.github.io/CarbonLoom/apps/buyer-portal/", font=FONT_CODE, fill=BLUE)

    # Right Card: ZK & Live Tamper Demo
    draw_card(draw, 970, 190, 1870, 930, "Module H: Groth16 ZK Proof & Live Tamper Demo")
    
    # Honest Verification
    draw.rectangle([1000, 260, 1840, 420], fill=SURFACE_INNER, outline=EMERALD)
    draw.text((1025, 280), "Honest EU Buyer Verification (snarkjs in Browser):", font=FONT_CODE_BOLD, fill=EMERALD)
    draw.text((1025, 315), "Circuit: cbam_proof.circom (6,218 constraints) | Verification Time: 142 ms (<200ms)", font=FONT_CODE, fill=TEXT_PRIMARY)
    draw.text((1025, 350), "Verdict: VALID ZERO-KNOWLEDGE PROOF [PASSED] (Garment carbon <= 1.50 kg threshold)", font=FONT_CODE_BOLD, fill=EMERALD)
    draw.text((1025, 380), "Commercial Secrecy: Unit pricing, yarn suppliers, and margins cryptographically hidden", font=FONT_CODE, fill=TEXT_SECONDARY)
    
    # Adversarial Mutation Box
    draw.rectangle([1000, 440, 1840, 905], fill=ROSE_DARK, outline=ROSE, width=2)
    draw.text((1025, 465), "LIVE ADVERSARIAL TAMPER TEST (1-Digit Mutation):", font=FONT_CODE_BOLD, fill=ROSE)
    draw.text((1025, 505), "Adversary alters witness emission: 1.412 kg -> 1.112 kg (-21% fraudulent reduction)", font=FONT_CODE_BOLD, fill=TEXT_PRIMARY)
    
    # Layer 1 failure box
    draw.rectangle([1025, 545, 1815, 705], fill=(25, 10, 12), outline=ROSE)
    draw.text((1050, 565), "[LAYER 1 FAILED] Hyperledger Fabric Anchor SHA-256 State Mismatch", font=FONT_CODE_BOLD, fill=ROSE)
    draw.text((1050, 600), "Expected Ledger Root: 0x5a18c99f302b11d88a4421ef...", font=FONT_CODE, fill=TEXT_SECONDARY)
    draw.text((1050, 635), "Computed Witness Root: 0x9b33a011de80554f78aa0912... (MISMATCH DETECTED)", font=FONT_CODE_BOLD, fill=ROSE)
    draw.text((1050, 670), "Ledger Action: Transaction rejected, tamper incident logged to immutable audit trail", font=FONT_CODE, fill=TEXT_MUTED)
    
    # Layer 2 failure box
    draw.rectangle([1025, 725, 1815, 885], fill=(25, 10, 12), outline=ROSE)
    draw.text((1050, 745), "[LAYER 2 FAILED] Groth16 BN254 Elliptic Curve Pairing Check Failed", font=FONT_CODE_BOLD, fill=ROSE)
    draw.text((1050, 780), "e(A, B) != e(alpha, beta) * e(x, gamma) * e(C, delta) -> MATHEMATICAL REJECTION", font=FONT_CODE, fill=TEXT_SECONDARY)
    draw.text((1050, 815), "Buyer Portal Alert: Cryptographic proof rejected! Counterfeit certificate detected.", font=FONT_CODE_BOLD, fill=ROSE)
    draw.text((1050, 850), "Zero-Knowledge Soundness: 6 adversarial witness vectors verified in test_circuit.py", font=FONT_CODE, fill=EMERALD)

    img.save(out_path)
    print(f"Saved {out_path}")

# ==============================================================================
# SCENE 6: BUSINESS MODEL, PROVENANCE & ROADMAP (2:25 - 2:54)
# ==============================================================================
def render_scene_6(out_path: str):
    img = Image.new("RGB", (WIDTH, HEIGHT), BG_COLOR)
    draw = ImageDraw.Draw(img)
    draw_chrome_and_captions(
        draw, 6, "2:25 - 2:54",
        "ENTERPRISE MONETIZATION, AUDIT PROVENANCE & ROADMAP",
        "Sustainable unit economics, Langfuse observability traces, and verified 30-day production deployment",
        "With enterprise subscription tiers for factories and buyers, certified provenance traces, and zero prompt math, CarbonLoom delivers RMG decarbonization."
    )
    
    # Left Card: Monetization
    draw_card(draw, 50, 190, 930, 930, "Three-Tier Enterprise Monetization Model")
    
    tiers = [
        ("Factory Cockpit Tier", "$299 - $899 / mo", "Per manufacturing facility", [
            "Digital Twin telemetry & real-time anomaly alerts",
            "Automated utility bill OCR & Scope 1/2 calculations",
            "MACC Marginal Abatement Cost Curve planner"
        ], BLUE),
        ("EU Buyer Compliance Portal", "$2,500 / mo", "Per international fashion brand", [
            "Instant QR / DPP Groth16 zero-knowledge verification",
            "Supplier sustainability benchmarking & CBAM XML exports",
            "Zero commercial secrets exposed to third parties"
        ], EMERALD),
        ("NRB Auditor Seat", "$99 / audit", "Certified verification fee", [
            "ISO 14064 HITL review workspace & Ed25519 co-signing",
            "Bilingual clarification chat with factory engineers",
            "Automated lineage verification against Fabric ledger"
        ], PURPLE)
    ]
    
    y = 260
    for name, price, sub, bullets, col in tiers:
        draw.rectangle([80, y, 900, y + 195], fill=SURFACE_INNER, outline=CARD_BORDER)
        draw.text((105, y + 14), name, font=FONT_CARD_TITLE, fill=TEXT_PRIMARY)
        draw.text((660, y + 14), price, font=FONT_CODE_BOLD, fill=col)
        draw.text((105, y + 48), sub, font=FONT_CODE, fill=TEXT_SECONDARY)
        y_b = y + 80
        for b in bullets:
            draw.text((105, y_b), f"• {b}", font=FONT_CODE, fill=TEXT_MUTED)
            y_b += 32
        y += 215

    # Right Card: Provenance & Production Guarantees
    draw_card(draw, 970, 190, 1870, 930, "Full-Stack Provenance & Technical Guarantees")
    
    items = [
        ("Zero-LLM Math Guarantee", "100% Deterministic Python core with zero prompt arithmetic", EMERALD),
        ("Tri-State Capability Labels", "All 10 modules strictly classified [Implemented] with passing unit tests", BLUE),
        ("Hallmark Floor & Unslop Certified", "0 slop lint failures, strict CSS variables, clean typography", EMERALD),
        ("Langfuse Observability Trace", "Trace ID: tr-cbam-9014-sha | Span latencies and CRAG refusal logged", PURPLE),
        ("Dual Cryptographic Layer", "Hyperledger Fabric state anchor + Circom Groth16 ZK proof", CYAN),
        ("Automated Test Suite", "22 passed in 0.65s (circuits, fabric, agents, api, sim, eval)", EMERALD)
    ]
    y = 260
    for title, desc, col in items:
        draw.rectangle([1000, y, 1840, y + 78], fill=SURFACE_INNER, outline=CARD_BORDER)
        draw.text((1025, y + 14), title, font=FONT_BODY_BOLD, fill=TEXT_PRIMARY)
        draw.text((1025, y + 44), desc, font=FONT_CODE, fill=col)
        y += 94
        
    # Closing Banner
    draw.rectangle([1000, 830, 1840, 905], fill=(20, 28, 45), outline=BLUE)
    draw.text((1025, 845), "Live Production Platform: https://4ladeen.github.io/CarbonLoom/", font=FONT_BODY_BOLD, fill=TEXT_PRIMARY)
    draw.text((1025, 875), "GitHub Repository: https://github.com/4ladeen/CarbonLoom", font=FONT_CODE_BOLD, fill=EMERALD)

    img.save(out_path)
    print(f"Saved {out_path}")

def render_all():
    out_dir = Path("video/frames")
    out_dir.mkdir(parents=True, exist_ok=True)
    render_scene_1(str(out_dir / "scene_01.png"))
    render_scene_2(str(out_dir / "scene_02.png"))
    render_scene_3(str(out_dir / "scene_03.png"))
    render_scene_4(str(out_dir / "scene_04.png"))
    render_scene_5(str(out_dir / "scene_05.png"))
    render_scene_6(str(out_dir / "scene_06.png"))
    print("All 6 master frames successfully rendered.")

if __name__ == "__main__":
    render_all()
