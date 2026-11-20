"""Render 1080p Master Scene Frames for CarbonLoom 180s Project Video.
Strictly follows Hallmark Floor and Unslop standards:
- 1080p canvas (1920x1080)
- Graphite token palette (#090d16 background, #111827 card, #1e293b border)
- Persistent [SIMULATED DATA] watermark
- No emojis, clean line art and geometric markers
- Bilingual typography (Segoe UI + Vrinda/Kalpurush + Consolas)
"""

import os
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

WIDTH, HEIGHT = 1920, 1080

# Colors from tokens.css
BG_COLOR = (9, 13, 22)         # #090d16
CARD_BG = (17, 24, 39)         # #111827
CARD_BORDER = (30, 41, 59)     # #1e293b
TEXT_PRIMARY = (248, 250, 252) # #f8fafc
TEXT_MUTED = (148, 163, 184)   # #94a3b8
TEXT_DIM = (100, 116, 139)     # #64748b
EMERALD = (16, 185, 129)       # #10b981
ROSE = (239, 68, 68)           # #ef4444
AMBER = (245, 158, 11)         # #f59e0b
BLUE = (59, 130, 246)          # #3b82f6
PURPLE = (168, 85, 247)        # #a855f7

FONT_DIR = "C:/Windows/Fonts"

def get_font(name: str, size: int):
    path = os.path.join(FONT_DIR, name)
    if os.path.exists(path):
        return ImageFont.truetype(path, size)
    return ImageFont.load_default()

FONT_TITLE = get_font("segoeuib.ttf", 44)
FONT_SUBTITLE = get_font("segoeui.ttf", 22)
FONT_CARD_TITLE = get_font("segoeuib.ttf", 26)
FONT_BODY = get_font("segoeui.ttf", 20)
FONT_BODY_BOLD = get_font("segoeuib.ttf", 20)
FONT_CODE = get_font("consola.ttf", 18)
FONT_CODE_BOLD = get_font("consolab.ttf", 18)
FONT_BIG_STAT = get_font("segoeuib.ttf", 68)
FONT_WATERMARK = get_font("segoeuib.ttf", 16)
FONT_BN = get_font("vrinda.ttf", 22)
FONT_BN_TITLE = get_font("vrindab.ttf", 24)

def draw_header_and_footer(draw: ImageDraw.ImageDraw, scene_num: int, scene_time: str, scene_title: str):
    # Top bar
    draw.rectangle([0, 0, WIDTH, 100], fill=(13, 18, 30))
    draw.line([0, 100, WIDTH, 100], fill=CARD_BORDER, width=2)
    
    # Title
    draw.text((60, 24), "CARBONLOOM", font=FONT_TITLE, fill=TEXT_PRIMARY)
    draw.text((380, 40), "|  Enterprise Decarbonization OS for Bangladesh RMG", font=FONT_SUBTITLE, fill=TEXT_MUTED)
    
    # Scene Badge
    badge_text = f"SCENE {scene_num}/6 : {scene_time}"
    draw.rectangle([WIDTH - 760, 28, WIDTH - 460, 72], fill=(30, 41, 59), outline=BLUE, width=1)
    draw.text((WIDTH - 740, 39), badge_text, font=FONT_CODE_BOLD, fill=BLUE)
    
    # Persistent Watermark (PRD 7.5 requirement)
    draw.rectangle([WIDTH - 440, 28, WIDTH - 60, 72], fill=(24, 20, 15), outline=AMBER, width=2)
    draw.text((WIDTH - 420, 39), "SIMULATED DATA [PILOT RUN]", font=FONT_WATERMARK, fill=AMBER)
    
    # Bottom Timeline Bar
    draw.rectangle([0, HEIGHT - 70, WIDTH, HEIGHT], fill=(13, 18, 30))
    draw.line([0, HEIGHT - 70, WIDTH, HEIGHT - 70], fill=CARD_BORDER, width=2)
    
    # Scrubber line
    progress = scene_num / 6.0
    scrub_w = int((WIDTH - 120) * progress)
    draw.rectangle([60, HEIGHT - 45, WIDTH - 60, HEIGHT - 35], fill=(30, 41, 59))
    draw.rectangle([60, HEIGHT - 45, 60 + scrub_w, HEIGHT - 35], fill=EMERALD)
    
    draw.text((60, HEIGHT - 28), f"Current Phase: {scene_title}", font=FONT_CODE, fill=TEXT_MUTED)
    draw.text((WIDTH - 300, HEIGHT - 28), "180s Monorepo Verification", font=FONT_CODE, fill=TEXT_DIM)

def draw_card(draw: ImageDraw.ImageDraw, x1, y1, x2, y2, title: str = "", fill=CARD_BG, border=CARD_BORDER):
    draw.rectangle([x1, y1, x2, y2], fill=fill, outline=border, width=2)
    if title:
        draw.rectangle([x1, y1, x2, y1 + 54], fill=(19, 28, 46))
        draw.line([x1, y1 + 54, x2, y1 + 54], fill=border, width=1)
        draw.text((x1 + 24, y1 + 14), title, font=FONT_CARD_TITLE, fill=TEXT_PRIMARY)

def render_scene_1(out_path: str):
    img = Image.new("RGB", (WIDTH, HEIGHT), BG_COLOR)
    draw = ImageDraw.Draw(img)
    draw_header_and_footer(draw, 1, "0:00 - 0:20", "The Double Squeeze")
    
    # Banner title
    draw.text((60, 130), "THE DOUBLE SQUEEZE", font=FONT_BIG_STAT, fill=TEXT_PRIMARY)
    draw.text((60, 215), "Why Bangladesh's $47B RMG Industry Faces a Structural Compliance Crisis", font=FONT_SUBTITLE, fill=TEXT_MUTED)
    
    # Left Card: Macro Threat
    draw_card(draw, 60, 270, 930, 960, "1. Macroeconomic Export Threat (EU Market)")
    draw.text((90, 350), "-11.91%", font=FONT_BIG_STAT, fill=ROSE)
    draw.text((90, 440), "Bangladesh RMG export dip to European Union (EPB FY2023-24)", font=FONT_BODY_BOLD, fill=TEXT_PRIMARY)
    
    draw.text((90, 490), "• EU CBAM Transition: Strict embedded carbon reporting for inputs", font=FONT_BODY, fill=TEXT_MUTED)
    draw.text((90, 525), "• ESPR Digital Product Passport: Per-garment QR auditability required", font=FONT_BODY, fill=TEXT_MUTED)
    draw.text((90, 560), "• Penalty Exposure: Up to €100/tCO2e if factory emissions are unverified", font=FONT_BODY, fill=TEXT_MUTED)
    draw.text((90, 595), "• Competitor Pressure: Vietnam and Turkey investing in certified MRV", font=FONT_BODY, fill=TEXT_MUTED)
    
    # Mini Bar chart
    draw.rectangle([90, 660, 890, 900], fill=(15, 23, 42), outline=CARD_BORDER)
    draw.text((110, 680), "EU Apparel Import Value Trend (€ Billions)", font=FONT_CODE_BOLD, fill=TEXT_MUTED)
    # 2022
    draw.rectangle([120, 840, 280, 860], fill=BLUE)
    draw.text((120, 810), "2022: €21.4B", font=FONT_CODE, fill=TEXT_PRIMARY)
    # 2023
    draw.rectangle([340, 780, 500, 860], fill=BLUE)
    draw.text((340, 750), "2023: €22.8B", font=FONT_CODE, fill=TEXT_PRIMARY)
    # 2024
    draw.rectangle([560, 820, 720, 860], fill=ROSE)
    draw.text((560, 790), "2024: €20.1B (-11.9%)", font=FONT_CODE, fill=ROSE)
    
    # Right Card: Utility Crisis
    draw_card(draw, 980, 270, 1860, 960, "2. Factory Floor Utility Inflation & Hidden Waste")
    
    metrics = [
        ("Titas Natural Gas", "+227.3%", "Tariff surge from 4.02 to 14.00 BDT/m3 in export industries", ROSE),
        ("DESCO Electricity", "+18.4%", "Staged peak tariff hikes pushing industrial power costs higher", AMBER),
        ("Diesel Backup", "4.8x Grid Cost", "Frequent load shedding forces dirty backup generator dispatch", ROSE),
        ("Hidden Floor Waste", "12% - 19%", "Fugitive steam leaks, uncalibrated stenters, idle motor draw", AMBER)
    ]
    
    y = 350
    for name, val, desc, col in metrics:
        draw.rectangle([1010, y, 1830, y + 120], fill=(15, 23, 42), outline=CARD_BORDER)
        draw.text((1035, y + 18), name, font=FONT_CARD_TITLE, fill=TEXT_PRIMARY)
        draw.text((1600, y + 16), val, font=FONT_CARD_TITLE, fill=col)
        draw.text((1035, y + 68), desc, font=FONT_BODY, fill=TEXT_MUTED)
        y += 140
        
    draw.text((1010, 920), "Target Factory: DBL Composite Knit (Gazipur, Bangladesh | 4,200 Workers | 1.8M pcs/mo)", font=FONT_CODE, fill=TEXT_DIM)
    
    img.save(out_path)
    print(f"Saved {out_path}")

def render_scene_2(out_path: str):
    img = Image.new("RGB", (WIDTH, HEIGHT), BG_COLOR)
    draw = ImageDraw.Draw(img)
    draw_header_and_footer(draw, 2, "0:20 - 0:45", "Bilingual Ingestion & Go MCP Gateway")
    
    draw.text((60, 130), "BILINGUAL MULTI-MODAL INGESTION & ZERO-TRUST MCP", font=FONT_BIG_STAT, fill=TEXT_PRIMARY)
    draw.text((60, 215), "Raw Bengali Utility Invoices Ingested Directly into Structured, Auditable JSON via 8-Server Gateway", font=FONT_SUBTITLE, fill=TEXT_MUTED)
    
    # Left Card: OCR
    draw_card(draw, 60, 270, 930, 960, "Module A: doc-vision-mcp (PaddleOCR + Donut Extractor)")
    
    # Simulated Bengali Bill
    draw.rectangle([90, 350, 890, 580], fill=(245, 247, 250), outline=(203, 213, 225))
    draw.text((120, 370), "ঢাকা ইলেকট্রিক সাপ্লাই কোম্পানি লিমিটেড (DESCO)", font=FONT_BN_TITLE, fill=(15, 23, 42))
    draw.text((120, 410), "বিদ্যুৎ বিল / আগস্ট ২০২৪ (LT-Industrial)", font=FONT_BN, fill=(51, 65, 85))
    draw.text((120, 450), "মিটারের নম্বর : LT-E-904128", font=FONT_BN, fill=(15, 23, 42))
    draw.text((120, 490), "ব্যবহৃত ইউনিট : ৪২,৫৫০ kWh  (42,550 kWh)", font=FONT_BN, fill=(15, 23, 42))
    draw.text((120, 530), "মোট প্রদেয় বিল : ৩,৬১,৬৭৫ ৳  (361,675 BDT)", font=FONT_BN, fill=(15, 23, 42))
    
    # Bounding box simulation
    draw.rectangle([110, 480, 560, 520], outline=EMERALD, width=2)
    draw.text((580, 490), "CONF: 98.5%", font=FONT_CODE_BOLD, fill=EMERALD)
    
    # JSON Output box
    draw.rectangle([90, 610, 890, 930], fill=(10, 15, 26), outline=CARD_BORDER)
    draw.text((110, 630), "Extracted JSON Payload (Validated Pydantic v2):", font=FONT_CODE_BOLD, fill=BLUE)
    json_lines = [
        '{',
        '  "utility": "DESCO",',
        '  "meter_id": "LT-E-904128",',
        '  "period": "2024-08",',
        '  "consumption_kwh": 42550.0,',
        '  "amount_bdt": 361675.0,',
        '  "emission_factor_gef": 0.620,  // DoE Bangladesh Grid Factor',
        '  "calculated_scope2_tco2e": 26.381,',
        '  "status": "AUTO_APPROVED",',
        '  "confidence_score": 0.988',
        '}'
    ]
    y_code = 665
    for jl in json_lines:
        draw.text((130, y_code), jl, font=FONT_CODE, fill=TEXT_MUTED if "//" not in jl else EMERALD)
        y_code += 24

    # Right Card: Go MCP Gateway
    draw_card(draw, 980, 270, 1860, 960, "Module D: Zero-Trust Go MCP Gateway (Sub-25ms p95)")
    
    draw.text((1010, 345), "Security Middleware Chain (Strict Go 1.22 stdlib):", font=FONT_BODY_BOLD, fill=TEXT_PRIMARY)
    
    steps = [
        ("1. Auth0 Ed25519 Token Authentication", "Validates bearer signature and tenant context"),
        ("2. Open Policy Agent (OPA) RBAC", "Enforces tenant isolation & row-level access"),
        ("3. Microsoft Presidio PII & Commercial Stripping", "Redacts unit costs, margins, and employee TINs"),
        ("4. Prompt Injection Defense Engine", "Blocks jailbreaks, prompt leaks, system exfiltration"),
        ("5. Single-Use Supervisor Approval Gating", "Requires human cryptographic token for all writes"),
        ("6. Hash-Chained Audit Ledger", "Appends SHA-256 integrity block for every call")
    ]
    y = 390
    for s_title, s_desc in steps:
        draw.rectangle([1010, y, 1830, y + 60], fill=(15, 23, 42), outline=CARD_BORDER)
        draw.text((1030, y + 10), s_title, font=FONT_CODE_BOLD, fill=EMERALD)
        draw.text((1030, y + 34), s_desc, font=FONT_CODE, fill=TEXT_MUTED)
        y += 72
        
    draw.text((1010, 835), "8 Isolated MCP Micro-Servers Running in Gateway:", font=FONT_BODY_BOLD, fill=TEXT_PRIMARY)
    servers = [
        "meter-mcp", "erp-mcp", "factors-mcp", "doc-vision-mcp",
        "regulatory-rag-mcp", "report-compliance-mcp", "cmms-supplier-mcp", "trust-zk-ledger-mcp"
    ]
    x_s = 1010
    y_s = 875
    for idx, s in enumerate(servers):
        draw.rectangle([x_s, y_s, x_s + 195, y_s + 45], fill=(30, 41, 59), outline=BLUE)
        draw.text((x_s + 12, y_s + 12), s, font=FONT_CODE, fill=TEXT_PRIMARY)
        x_s += 205
        if (idx + 1) % 4 == 0:
            x_s = 1010
            y_s += 52

    img.save(out_path)
    print(f"Saved {out_path}")

def render_scene_3(out_path: str):
    img = Image.new("RGB", (WIDTH, HEIGHT), BG_COLOR)
    draw = ImageDraw.Draw(img)
    draw_header_and_footer(draw, 3, "0:45 - 1:15", "Forensic XAI Waste Detection")
    
    draw.text((60, 130), "FORENSIC XAI WASTE DETECTION & DIGITAL TWIN", font=FONT_BIG_STAT, fill=TEXT_PRIMARY)
    draw.text((60, 215), "Digital Twin Telemetry Replay + Isolation Forest + TreeSHAP Flags Boiler Steam-Trap Failure", font=FONT_SUBTITLE, fill=TEXT_MUTED)
    
    # Left Card: Telemetry
    draw_card(draw, 60, 270, 930, 960, "Module B: Digital Twin Telemetry (Ground-Truth Injected Faults)")
    
    sensors = [
        ("BOILER-01 Gas Flow", "184.2 m3/h", "Expected: 140.0 m3/h (+31.5% spike)", ROSE),
        ("BOILER-01 Exhaust Temp", "246.5 °C", "Baseline: 175.0 °C (Steam blow-by)", ROSE),
        ("BOILER-01 Steam Pressure", "7.8 bar", "Target: 8.0 bar (Sub-optimal pressure)", AMBER),
        ("GENSET-01 Diesel Burn", "48.2 L/h", "Grid Available: Sub-optimal dispatch", AMBER),
        ("STENTER-02 Electrical Power", "142.0 kW", "Normal operating range", EMERALD),
        ("COMPRESSOR-03 Pressure", "6.2 bar", "Baseline: 6.5 bar (Minor leakage)", AMBER)
    ]
    y = 350
    for name, val, desc, col in sensors:
        draw.rectangle([90, y, 890, y + 80], fill=(15, 23, 42), outline=CARD_BORDER)
        draw.text((115, y + 14), name, font=FONT_BODY_BOLD, fill=TEXT_PRIMARY)
        draw.text((700, y + 14), val, font=FONT_CODE_BOLD, fill=col)
        draw.text((115, y + 46), desc, font=FONT_CODE, fill=TEXT_MUTED)
        y += 95
        
    draw.rectangle([90, 890, 890, 940], fill=(45, 15, 20), outline=ROSE)
    draw.text((115, 905), "ANOMALY DETECTED: Score 0.842 (CRITICAL) | Model: Isolation Forest", font=FONT_CODE_BOLD, fill=ROSE)

    # Right Card: TreeSHAP Waterfall
    draw_card(draw, 980, 270, 1860, 960, "Module E: TreeSHAP Attribution & Gated CMMS Remediation")
    
    draw.text((1010, 345), "TreeSHAP Anomaly Contribution Waterfall:", font=FONT_BODY_BOLD, fill=TEXT_PRIMARY)
    
    # Waterfall visual
    draw.rectangle([1010, 385, 1830, 640], fill=(15, 23, 42), outline=CARD_BORDER)
    
    draw.text((1035, 410), "Baseline Emissions Expected: 142.3 kg CO2e/h", font=FONT_CODE, fill=TEXT_MUTED)
    draw.rectangle([1035, 440, 1350, 475], fill=(30, 41, 59))
    
    draw.text((1035, 490), "+ Exhaust Temperature (>240°C): +28.4 kg CO2e/h (84.2% attribution)", font=FONT_CODE_BOLD, fill=ROSE)
    draw.rectangle([1350, 515, 1620, 550], fill=ROSE)
    
    draw.text((1035, 565), "+ Diesel Genset Dispatched During Grid: +12.1 kg CO2e/h (15.8% attribution)", font=FONT_CODE_BOLD, fill=AMBER)
    draw.rectangle([1620, 590, 1740, 625], fill=AMBER)
    
    # CMMS Ticket
    draw_card(draw, 1010, 660, 1830, 940, "Automated CMMS Ticket #WO-2024-0891 (Human Approval Gated)")
    draw.text((1035, 735), "Action Proposed: Replace inverted bucket steam trap #ST-402 on Boiler 1", font=FONT_BODY_BOLD, fill=TEXT_PRIMARY)
    draw.text((1035, 775), "Financial Payback: $3,420 monthly gas savings | Carbon Impact: -18.4 tCO2e/mo", font=FONT_BODY, fill=EMERALD)
    draw.text((1035, 815), "Required Approval: Human Supervisor (Facility Manager)", font=FONT_BODY, fill=TEXT_MUTED)
    
    draw.rectangle([1035, 860, 1380, 915], fill=(16, 185, 129, 40), outline=EMERALD, width=2)
    draw.text((1060, 878), "APPROVE TICKET", font=FONT_CODE_BOLD, fill=EMERALD)
    
    draw.rectangle([1400, 860, 1790, 915], fill=(30, 41, 59), outline=CARD_BORDER)
    draw.text((1420, 878), "Token: APP-TKN-8921-OK", font=FONT_CODE, fill=BLUE)

    img.save(out_path)
    print(f"Saved {out_path}")

def render_scene_4(out_path: str):
    img = Image.new("RGB", (WIDTH, HEIGHT), BG_COLOR)
    draw = ImageDraw.Draw(img)
    draw_header_and_footer(draw, 4, "1:15 - 1:40", "Bangla GraphRAG & Refusal Rule")
    
    draw.text((60, 130), "BANGLA GRAPHRAG & STRICT CRAG REFUSAL", font=FONT_BIG_STAT, fill=TEXT_PRIMARY)
    draw.text((60, 215), "Hybrid Knowledge Graph (Neo4j + pgvector) with Strict Refusal on Unbacked Speculative Prompts", font=FONT_SUBTITLE, fill=TEXT_MUTED)
    
    # Top Card: Grounded Answer
    draw_card(draw, 60, 270, 1860, 600, "1. Grounded Regulatory Query (Exact Page Citations)")
    
    # User prompt
    draw.rectangle([90, 345, 1830, 405], fill=(30, 41, 59), outline=CARD_BORDER)
    draw.text((115, 360), "User (Factory Manager): আমাদের রফতানি করা সুতি টি-শার্টের জন্য ইউরোপীয় ইউনিয়নের সিবিএএম রিপোর্ট কীভাবে তৈরি করব?", font=FONT_BN, fill=TEXT_PRIMARY)
    
    # Agent response
    draw.rectangle([90, 420, 1830, 580], fill=(15, 23, 42), outline=EMERALD)
    draw.text((115, 435), "CarbonLoom Agent (Grounded in EU CBAM & ESPR Ontology):", font=FONT_CODE_BOLD, fill=EMERALD)
    draw.text((115, 470), "EU CBAM রেগুলেশন ২০২৩/৯৫৬ এর এনেক্স ৪ (অনুচ্ছেদ ৩.১) অনুযায়ী, বোনা পোশাক ও টেক্সটাইলের জন্য সরাসরি নির্গমন (Scope 1)", font=FONT_BN, fill=TEXT_PRIMARY)
    draw.text((115, 505), "এবং ব্যবহৃত গ্রিড বিদ্যুতের পরোক্ষ নির্গমন (Scope 2) এসএমভি (SMV) সূত্রের ভিত্তিতে প্রতি পোশাকে বণ্টন করতে হবে।", font=FONT_BN, fill=TEXT_PRIMARY)
    draw.text((115, 545), "Verified Citations: [EU CBAM Regulation 2023/956, Annex IV §3.1, p. 44]  |  [ESPR Delegated Act Art. 7, p. 18] (Confidence: 0.96)", font=FONT_CODE, fill=BLUE)

    # Bottom Card: Refusal Rule
    draw_card(draw, 60, 620, 1860, 960, "2. Corrective RAG (CRAG) Speculative Refusal Rule")
    
    # User speculative query
    draw.rectangle([90, 695, 1830, 755], fill=(30, 41, 59), outline=CARD_BORDER)
    draw.text((115, 715), "User: What will the EU CBAM allowance price per ton be in December 2035?", font=FONT_BODY_BOLD, fill=TEXT_PRIMARY)
    
    # Agent refusal
    draw.rectangle([90, 770, 1830, 935], fill=(45, 15, 20), outline=ROSE)
    draw.text((115, 790), "CarbonLoom Agent (CRAG Confidence < 0.70 Threshold Triggered):", font=FONT_CODE_BOLD, fill=ROSE)
    draw.text((115, 830), "তথ্য অপর্যাপ্ত (Confidence: 0.32) - আমি কোনো অনুমানমূলক জল্পনা-কল্পনা বা অনির্ভরযোগ্য মূল্য পূর্বাভাস দিতে পারি না।", font=FONT_BN_TITLE, fill=TEXT_PRIMARY)
    draw.text((115, 875), "CRAG Invariant: CarbonLoom refuses hallucinations or speculative carbon forecasts without binding legal statutes.", font=FONT_BODY, fill=TEXT_MUTED)

    img.save(out_path)
    print(f"Saved {out_path}")

def render_scene_5(out_path: str):
    img = Image.new("RGB", (WIDTH, HEIGHT), BG_COLOR)
    draw = ImageDraw.Draw(img)
    draw_header_and_footer(draw, 5, "1:40 - 2:25", "Per-Garment Carbon & Cryptographic Tamper Test")
    
    draw.text((60, 130), "PER-GARMENT CARBON & LIVE TAMPER TEST", font=FONT_BIG_STAT, fill=TEXT_PRIMARY)
    draw.text((60, 215), "Deterministic SMV Allocation + NRB Ed25519 Co-Sign + Groth16 ZK Proof + Instant Red Tamper Failure", font=FONT_SUBTITLE, fill=TEXT_MUTED)
    
    # Left Card: SMV & NRB
    draw_card(draw, 60, 270, 930, 960, "Module G: SMV Garment Passport & NRB HITL Co-Sign")
    
    draw.text((90, 350), "Production Order: 100% Organic Cotton Crewneck (Batch #8921)", font=FONT_BODY_BOLD, fill=TEXT_PRIMARY)
    draw.text((90, 385), "Standard Minute Value (SMV): 14.50 mins | Volume: 50,000 pcs", font=FONT_BODY, fill=TEXT_MUTED)
    
    # Receipt
    draw.rectangle([90, 430, 890, 680], fill=(15, 23, 42), outline=CARD_BORDER)
    draw.text((115, 455), "Carbon Footprint per Garment (Deterministic Math):", font=FONT_CODE_BOLD, fill=TEXT_PRIMARY)
    draw.text((115, 500), "• Direct Combustion (Scope 1):  0.812 kg CO2e / pc", font=FONT_CODE, fill=TEXT_MUTED)
    draw.text((115, 540), "• Purchased Electricity (Scope 2): 0.600 kg CO2e / pc", font=FONT_CODE, fill=TEXT_MUTED)
    draw.text((115, 580), "• Total Embedded Emissions:     1.412 kg CO2e / pc", font=FONT_CODE_BOLD, fill=EMERALD)
    draw.text((115, 625), "Allocation Method: Direct SMV line balance (DIN EN ISO 14064-1)", font=FONT_CODE, fill=TEXT_DIM)
    
    # NRB Co-sign
    draw.rectangle([90, 710, 890, 930], fill=(20, 30, 50), outline=BLUE)
    draw.text((115, 735), "NRB Lead Verifier Co-Signature (Human-In-The-Loop):", font=FONT_CODE_BOLD, fill=BLUE)
    draw.text((115, 775), "Auditor: Dr. A. Rahman (Lead Verifier ISO 14064, London / Dhaka)", font=FONT_BODY, fill=TEXT_PRIMARY)
    draw.text((115, 815), "Ed25519 Pubkey: 0x98f4c...c20b | Status: APPROVED & CO-SIGNED", font=FONT_CODE, fill=EMERALD)
    draw.text((115, 855), "Fabric Merkle Root: 0x5a18c99f302b11d88a4421ef...", font=FONT_CODE, fill=TEXT_MUTED)
    draw.text((115, 895), "Audit Timestamp: 2024-08-20T14:22:18Z", font=FONT_CODE, fill=TEXT_DIM)

    # Right Card: ZK & Tamper
    draw_card(draw, 980, 270, 1860, 960, "Module H: Groth16 ZK Proof & Live Tamper Demo")
    
    # Honest Verification
    draw.rectangle([1010, 350, 1830, 520], fill=(15, 23, 42), outline=EMERALD)
    draw.text((1035, 375), "Honest EU Buyer Verification (snarkjs in Browser):", font=FONT_CODE_BOLD, fill=EMERALD)
    draw.text((1035, 415), "Circuit: cbam_proof.circom (6,218 constraints) | Time: 142 ms (<200ms)", font=FONT_CODE, fill=TEXT_PRIMARY)
    draw.text((1035, 455), "Result: VALID PROOF [PASS] (Garment carbon <= 1.50 kg threshold)", font=FONT_CODE_BOLD, fill=EMERALD)
    draw.text((1035, 485), "Commercial Privacy: Yarn unit price and supplier identities concealed", font=FONT_CODE, fill=TEXT_MUTED)
    
    # Tamper Simulation Box
    draw.rectangle([1010, 550, 1830, 930], fill=(45, 15, 20), outline=ROSE, width=2)
    draw.text((1035, 575), "LIVE ADVERSARIAL TAMPER TEST (1-Digit Mutation):", font=FONT_CODE_BOLD, fill=ROSE)
    draw.text((1035, 615), "Adversary alters witness emission: 1.412 kg -> 1.112 kg (-21% fraudulent claim)", font=FONT_CODE, fill=TEXT_PRIMARY)
    
    # Dual failure boxes
    draw.rectangle([1035, 665, 1805, 775], fill=(25, 10, 12), outline=ROSE)
    draw.text((1060, 685), "[LAYER 1 FAILED] Hyperledger Fabric Anchor SHA-256 State Mismatch", font=FONT_CODE_BOLD, fill=ROSE)
    draw.text((1060, 715), "Expected: 0x5a18c99f... | Computed: 0x9b33a011... (MISMATCH)", font=FONT_CODE, fill=TEXT_MUTED)
    draw.text((1060, 745), "Ledger Action: Transaction rejected, security incident logged to audit trail", font=FONT_CODE, fill=TEXT_DIM)
    
    draw.rectangle([1035, 795, 1805, 905], fill=(25, 10, 12), outline=ROSE)
    draw.text((1060, 815), "[LAYER 2 FAILED] Groth16 BN254 Elliptic Curve Pairing Check Failed", font=FONT_CODE_BOLD, fill=ROSE)
    draw.text((1060, 845), "e(A, B) != e(alpha, beta) * e(x, gamma) * e(C, delta) -> REJECTED", font=FONT_CODE, fill=TEXT_MUTED)
    draw.text((1060, 875), "Buyer Alert: Cryptographic proof is mathematically invalid!", font=FONT_CODE_BOLD, fill=ROSE)

    img.save(out_path)
    print(f"Saved {out_path}")

def render_scene_6(out_path: str):
    img = Image.new("RGB", (WIDTH, HEIGHT), BG_COLOR)
    draw = ImageDraw.Draw(img)
    draw_header_and_footer(draw, 6, "2:25 - 2:52", "Business Model, Provenance & Roadmap")
    
    draw.text((60, 130), "BUSINESS MODEL, PROVENANCE & ROADMAP", font=FONT_BIG_STAT, fill=TEXT_PRIMARY)
    draw.text((60, 215), "Production-Grade Decarbonization OS: Unit Economics, Audit Provenance, and 30-Day Deployment", font=FONT_SUBTITLE, fill=TEXT_MUTED)
    
    # Left Card: Monetization
    draw_card(draw, 60, 270, 930, 960, "Three-Tier Enterprise Monetization Model")
    
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
    
    y = 350
    for name, price, sub, bullets, col in tiers:
        draw.rectangle([90, y, 890, y + 175], fill=(15, 23, 42), outline=CARD_BORDER)
        draw.text((115, y + 14), name, font=FONT_CARD_TITLE, fill=TEXT_PRIMARY)
        draw.text((660, y + 14), price, font=FONT_CODE_BOLD, fill=col)
        draw.text((115, y + 48), sub, font=FONT_CODE, fill=TEXT_MUTED)
        y_b = y + 78
        for b in bullets:
            draw.text((115, y_b), f"• {b}", font=FONT_CODE, fill=TEXT_DIM)
            y_b += 28
        y += 195

    # Right Card: Provenance & Guarantees
    draw_card(draw, 980, 270, 1860, 960, "Full-Stack Provenance & Technical Guarantees")
    
    items = [
        ("Zero-LLM Math Guarantee", "100% Deterministic Python core with zero prompt math"),
        ("Tri-State Capability Labels", "All modules strictly classified [Implemented] with passing unit tests"),
        ("Hallmark Floor Certified", "0 slop lint failures, strict CSS tokens, clean typography"),
        ("Langfuse Observability Trace", "Trace ID: tr-cbam-9014-sha | Span latencies and CRAG refusal logged"),
        ("Dual Cryptographic Layer", "Hyperledger Fabric state anchor + Circom Groth16 ZK proof"),
        ("Open Source Monorepo", "Full production code: services, mcp, circuits, fabric, apps")
    ]
    y = 350
    for title, desc in items:
        draw.rectangle([1010, y, 1830, y + 68], fill=(15, 23, 42), outline=CARD_BORDER)
        draw.text((1035, y + 12), title, font=FONT_BODY_BOLD, fill=TEXT_PRIMARY)
        draw.text((1035, y + 38), desc, font=FONT_CODE, fill=EMERALD)
        y += 82
        
    # Bottom callout
    draw.rectangle([1010, 850, 1830, 930], fill=(20, 30, 50), outline=BLUE)
    draw.text((1035, 868), "CarbonLoom: Bangladesh RMG Decarbonization from Vibe to Production.", font=FONT_BODY_BOLD, fill=TEXT_PRIMARY)
    draw.text((1035, 898), "Live Production Demo: https://carbonloom.app  |  GitHub: carbonloom/carbonloom", font=FONT_CODE, fill=BLUE)

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
