#!/usr/bin/env python3
import math
import struct
import wave
import json
from pathlib import Path
import random

# Root of the project (assuming script is in /scripts)
PROJECT_DIR = Path(__file__).parent.parent
BASE_DIR = PROJECT_DIR / "public" / "sounds"
BASE_DIR.mkdir(parents=True, exist_ok=True)

# Audio parameters
SAMPLE_RATE = 44100
DURATION = 15  # seconds
AMPLITUDE = 0.3 * 32767  # Volume (0-1 scaled to int16)

# Elements data
AMBIENT_ELEMENTS = {
    "water": [
        {"id": "water", "name": "Água do Rio", "type": "water"},
        {"id": "ocean", "name": "Ondas do Oceano", "type": "waves"},
        {"id": "waterfall", "name": "Cachoeira", "type": "noise"},
    ],
    "weather": [
        {"id": "rain", "name": "Chuva Forte", "type": "rain"},
        {"id": "thunder", "name": "Trovão Distante", "type": "rumble"},
        {"id": "wind", "name": "Vento Suave", "type": "wind"},
        {"id": "storm", "name": "Tempestade", "type": "storm"},
    ],
    "nature": [
        {"id": "birds", "name": "Pássaros da Floresta", "type": "birds"},
        {"id": "forest", "name": "Floresta Tropical", "type": "ambient"},
        {"id": "crickets", "name": "Grilos Noturnos", "type": "crickets"},
        {"id": "leaves", "name": "Folhas ao Vento", "type": "rustle"},
    ],
    "mystical": [
        {"id": "bells", "name": "Sinos Tibetanos", "type": "bell"},
        {"id": "gong", "name": "Gongo Meditativo", "type": "gong"},
        {"id": "singing_bowl", "name": "Tigela Cantante", "type": "bowl"},
    ],
    "elemental": [
        {"id": "fire", "name": "Fogo Crepitante", "type": "fire"},
        {"id": "lava", "name": "Lava Fluindo", "type": "lava"},
    ]
}

def generate_wave(file_path, sound_type):
    num_samples = SAMPLE_RATE * DURATION
    with wave.open(str(file_path), 'w') as f:
        f.setnchannels(1) # Mono
        f.setsampwidth(2) # 2 bytes per sample (int16)
        f.setframerate(SAMPLE_RATE)
        
        samples = []
        for i in range(num_samples):
            t = i / SAMPLE_RATE
            val = 0
            
            if sound_type == "water":
                # Mix of sines with amplitude modulation
                val = 0.6 * math.sin(2 * math.pi * 200 * t) + 0.4 * math.sin(2 * math.pi * 250 * t)
                val *= (0.7 + 0.3 * math.sin(2 * math.pi * 0.5 * t))
            elif sound_type == "waves":
                # Noise rhythmic pulse
                white_noise = random.uniform(-1, 1)
                env = 0.5 + 0.5 * math.sin(2 * math.pi * 0.1 * t)
                val = white_noise * env
            elif sound_type == "noise":
                # Pure white noise
                val = random.uniform(-1, 1)
            elif sound_type == "rain":
                # High frequency noise + fast pulse
                val = random.uniform(-1, 1) * 0.5 + (0.2 if random.random() > 0.99 else 0)
            elif sound_type == "bell":
                # Pure sine with decay
                val = math.sin(2 * math.pi * 528 * t) * math.exp(-t / 4)
            elif sound_type == "bowl":
                # Pulsing sine
                val = math.sin(2 * math.pi * 432 * t) * (0.8 + 0.2 * math.sin(2 * math.pi * 2 * t))
            elif sound_type == "fire":
                # Crackling noise
                val = random.uniform(-1, 1) * 0.2
                if random.random() > 0.999: val = 0.8
            elif sound_type == "wind":
                # Filtered-like noise (simple low pass simulation)
                val = random.uniform(-1, 1) * (0.5 + 0.5 * math.sin(2 * math.pi * 0.05 * t))
            elif sound_type == "birds":
                # Chirps
                if (t * 2) % 1 < 0.2:
                    val = math.sin(2 * math.pi * 1500 * t) * math.sin(2 * math.pi * 10 * t)
            else:
                val = math.sin(2 * math.pi * 440 * t) * 0.1

            # Clamp and scale
            val = max(-1, min(1, val))
            sample = struct.pack('<h', int(val * AMPLITUDE))
            samples.append(sample)
            
        f.writeframes(b''.join(samples))

def main():
    print(f"Generating 17 demo audios in {BASE_DIR} (Zero Dependencies)...")
    
    for category, elements in AMBIENT_ELEMENTS.items():
        cat_dir = BASE_DIR / category
        cat_dir.mkdir(exist_ok=True)
        
        for el in elements:
            print(f"Creating: {el['name']}...")
            file_path = cat_dir / f"{el['id']}.wav"
            generate_wave(file_path, el['type'])
            print(f"✓ Saved {file_path}")

    # Manifest
    manifest = {
        "version": "1.1",
        "generated_at": "2026-03-29",
        "method": "Pure Python (Wave/Struct)",
        "total_files": 16
    }
    with open(BASE_DIR / "manifest.json", "w") as f:
        json.dump(manifest, f, indent=2)
    print("✓ Created manifest.json")

if __name__ == "__main__":
    main()
