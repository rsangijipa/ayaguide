#!/usr/bin/env python3
import os
import json
from pathlib import Path
try:
    from elevenlabs.client import ElevenLabs
except ImportError:
    print("Error: 'elevenlabs' library not found. Please install it with 'pip install elevenlabs'")
    exit(1)

# Root of the project (assuming script is in /scripts)
PROJECT_DIR = Path(__file__).parent.parent
BASE_DIR = PROJECT_DIR / "public" / "sounds"
BASE_DIR.mkdir(parents=True, exist_ok=True)

# Configurar cliente ElevenLabs
api_key = os.getenv('ELEVENLABS_API_KEY')
if not api_key:
    print("Error: ELEVENLABS_API_KEY environment variable not set.")
    exit(1)

client = ElevenLabs(api_key=api_key)

# Data from ambientElements.ts
AMBIENT_ELEMENTS = {
    "water": [
        {"id": "water", "name": "Água do Rio", "prompt": "Gentle flowing river water with soft ripples and waves."},
        {"id": "ocean", "name": "Ondas do Oceano", "prompt": "Ocean waves crashing on the beach with rhythmic tides."},
        {"id": "waterfall", "name": "Cachoeira", "prompt": "Powerful waterfall cascading down with rushing water sounds."},
    ],
    "weather": [
        {"id": "rain", "name": "Chuva Forte", "prompt": "Heavy rain falling with rhythmic patter on surfaces."},
        {"id": "thunder", "name": "Trovão Distante", "prompt": "Distant thunder rolling and echoing across the sky."},
        {"id": "wind", "name": "Vento Suave", "prompt": "Gentle breeze flowing continuously and softly."},
        {"id": "storm", "name": "Tempestade", "prompt": "Complete storm with rain, wind, and thunder together."},
    ],
    "nature": [
        {"id": "birds", "name": "Pássaros da Floresta", "prompt": "Forest birds singing in the morning with natural chirping sounds."},
        {"id": "forest", "name": "Floresta Tropical", "prompt": "Tropical forest ambience with insects, birds, and jungle sounds."},
        {"id": "crickets", "name": "Grilos Noturnos", "prompt": "Crickets chirping rhythmically at night in natural patterns."},
        {"id": "leaves", "name": "Folhas ao Vento", "prompt": "Leaves rustling gently in the wind with soft movements."},
    ],
    "mystical": [
        {"id": "bells", "name": "Sinos Tibetanos", "prompt": "Tibetan singing bowls with crystalline harmonic tones."},
        {"id": "gong", "name": "Gongo Meditativo", "prompt": "Deep gong meditation sound with cosmic vibration."},
        {"id": "singing_bowl", "name": "Tigela Cantante", "prompt": "Singing bowl with pure harmonic tones for deep meditation."},
    ],
    "elemental": [
        {"id": "fire", "name": "Fogo Crepitante", "prompt": "Crackling fire with transformative energy and warmth."},
        {"id": "lava", "name": "Lava Fluindo", "prompt": "Deep flowing lava with primordial power and transformation."},
    ]
}

def main():
    print(f"Generating HIGH-FIDELITY Sound Effects using ElevenLabs at: {BASE_DIR}")

    total = sum(len(els) for els in AMBIENT_ELEMENTS.values())
    current = 0

    for category, elements in AMBIENT_ELEMENTS.items():
        cat_dir = BASE_DIR / category
        cat_dir.mkdir(exist_ok=True)

        for el in elements:
            current += 1
            file_path = cat_dir / f"{el['id']}.mp3"

            if file_path.exists():
                print(f"[{current}/{total}] Skipping {el['name']} (already exists)")
                continue

            print(f"[{current}/{total}] Generating Sound Effect: {el['name']}...")
            try:
                # Using the correct Sound Effects API (not text-to-speech)
                audio = client.text_to_sound_effects.convert(
                    text=el['prompt'],
                    duration_seconds=15.0, # Target 15s for meditation loop
                    prompt_influence=0.8
                )

                with open(file_path, 'wb') as f:
                    for chunk in audio:
                        f.write(chunk)
                print(f"✓ Saved {file_path}")
            except Exception as e:
                print(f"✗ Error: {e}")

    print("\n✓ ElevenLabs generation complete.")

if __name__ == "__main__":
    main()
