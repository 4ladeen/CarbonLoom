#!/usr/bin/env python3
"""
Generate clean, natural, simple voiceover clips using Windows SAPI SpeechSynthesizer.
No sound effects, no synth beeps, no sirens. Pure, clear spoken voiceover.
"""

from __future__ import annotations

import subprocess
from pathlib import Path
from typing import Final

VIDEO_DIR: Final[Path] = Path(__file__).resolve().parent
VOICES_DIR: Final[Path] = VIDEO_DIR / "voice_clips"
VOICES_DIR.mkdir(parents=True, exist_ok=True)

SCRIPTS: list[dict[str, str | float]] = [
    {
        "id": "1a",
        "dur": 10.0,
        "text": "Bangladesh ready-made garment exporters face an urgent double squeeze. In 2024, EU apparel shipments fell 11.9 percent, while domestic gas tariffs surged over 200 percent."
    },
    {
        "id": "1b",
        "dur": 10.0,
        "text": "At our pilot facility in Gazipur, 18 Modbus RTU meters continuously monitor thermal boilers, stenters, and rooftop solar under strict European buyer caps."
    },
    {
        "id": "2a",
        "dur": 12.0,
        "text": "CarbonLoom's vision ingestion extracts consumption, meter identifiers, and tariffs from bilingual Bengali DESCO electricity invoices into auditable JSON."
    },
    {
        "id": "2b",
        "dur": 13.0,
        "text": "All telemetry and utility records pass through an eight-server zero-trust Go gateway, enforcing tenant isolation, Modbus CRC verification, and prompt injection defense in under 25 milliseconds."
    },
    {
        "id": "3a",
        "dur": 15.0,
        "text": "Our digital twin factory simulator tracks live wattage and gas enthalpy. When an uncharacteristic spike occurs, an Isolation Forest model flags a critical anomaly score of 0.84."
    },
    {
        "id": "3b",
        "dur": 15.0,
        "text": "TreeSHAP feature attribution pinpoints 84 percent of excess waste to a steam trap leak on Boiler One, automatically proposing a maintenance work order gated by a supervisor token."
    },
    {
        "id": "4a",
        "dur": 12.0,
        "text": "Bilingual GraphRAG grounds factory inquiries in official European Union directives, linking EU CBAM Annex Four and ESPR Article Seven directly to factory equipment."
    },
    {
        "id": "4b",
        "dur": 13.0,
        "text": "When presented with speculative queries such as ten-year carbon price forecasts, corrective RAG triggers strict refusal, guaranteeing zero mathematical or regulatory hallucinations."
    },
    {
        "id": "5a",
        "dur": 15.0,
        "text": "Using deterministic standard minute value allocation, we calculate exactly 1.412 kilograms of CO2 equivalent per garment, co-signed by an ISO 14064 auditor on Hyperledger Fabric."
    },
    {
        "id": "5b",
        "dur": 15.0,
        "text": "In the Public Buyer Portal, global customs and brand buyers verify Groth16 zero-knowledge proofs in 142 milliseconds via WebAssembly, shielding factory trade secrets."
    },
    {
        "id": "5c",
        "dur": 15.0,
        "text": "If an adversary attempts to modify the carbon figure from 1.412 to 1.112, both the Fabric Merkle root and Groth16 elliptic curve checks instantly reject the record."
    },
    {
        "id": "6a",
        "dur": 15.0,
        "text": "With three enterprise tiers from Factory Starter to Buyer Enterprise, CarbonLoom pays for itself in under 4.2 months through avoided utility waste and CBAM tariff penalties."
    },
    {
        "id": "6b",
        "dur": 14.0,
        "text": "Backed by verifiable provenance audit trails, 22 passing test suites, and zero prompt math, CarbonLoom delivers industrial decarbonization from concept to production."
    },
]


def generate_voiceover_clips() -> list[Path]:
    generated_files: list[Path] = []
    
    ps_script_path = VIDEO_DIR / "_gen_tts.ps1"
    
    ps_lines: list[str] = [
        "Add-Type -AssemblyName System.Speech",
        "$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer",
        "$synth.SelectVoice('Microsoft Zira Desktop')",
        "$synth.Rate = 0",
        "$synth.Volume = 100",
    ]
    
    for item in SCRIPTS:
        clip_id = str(item["id"])
        text = str(item["text"]).replace("'", "''")
        out_wav = (VOICES_DIR / f"clip_{clip_id}.wav").resolve()
        ps_lines.append(f"$synth.SetOutputToWaveFile('{out_wav}')")
        ps_lines.append(f"$synth.Speak('{text}')")
        generated_files.append(out_wav)
        
    ps_lines.append("$synth.Dispose()")
    
    ps_script_path.write_text("\n".join(ps_lines), encoding="utf-8")
    
    cmd = ["powershell", "-ExecutionPolicy", "Bypass", "-File", str(ps_script_path)]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print("Error running powershell TTS:", res.stderr)
        raise RuntimeError("TTS generation failed")
        
    if ps_script_path.exists():
        ps_script_path.unlink()
        
    print(f"Generated {len(generated_files)} voice clips in {VOICES_DIR}")
    return generated_files


if __name__ == "__main__":
    generate_voiceover_clips()
