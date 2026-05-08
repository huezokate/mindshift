#!/usr/bin/env python3
"""Generate portrait avatars for historical figures using Freepik AI text-to-image."""

import os
import base64
import time
import requests

API_KEY = "FPSXabe41fd7997856e9141bec25c8a499d4"
API_URL = "https://api.freepik.com/v1/ai/text-to-image"

FIGURES = [
    "Napoleon Bonaparte",
    "Donald Trump",
    "Vladimir Lenin",
    "Socrates",
    "Abraham Lincoln",
    "Dolly Parton",
    "Frida Kahlo",
    "Maya Angelou",
    "Salvador Dali",
    "Nelson Mandela",
    "Chuck Norris",
    "Ching Shih",
    "Rosa Parks",
    "Mahatma Gandhi",
    "Che Guevara",
]

STYLES = {
    "cyberpunk": {
        "suffix": "cyberpunk",
        "prompt": (
            "Pixel art portrait avatar of {figure}, cyberpunk style. "
            "Deep dark background with neon city grid. Face rendered in chunky pixels, "
            "dramatic magenta and electric blue neon lighting, purple shadows. "
            "Intense glowing eyes, holographic star or badge detail on chest. "
            "Dark coat or period-accurate outfit remixed with cyberpunk elements. "
            "Synthwave color palette: deep navy, hot pink, electric blue, purple. "
            "16-bit retro pixel art. Square composition, bust portrait. "
            "No text, no watermarks."
        ),
    },
    "kawaii": {
        "suffix": "kawaii",
        "prompt": (
            "Kawaii anime-style illustration portrait avatar of {figure}. "
            "Soft pastel palette: blush pink, lavender, mint, peach, cream. "
            "Large expressive sparkly eyes with holographic irises. "
            "Chibi-proportioned face, rosy cheeks. Hair adorned with tiny stars, "
            "hearts, and flowers. Pastel robe or outfit with star and flower prints. "
            "Beaded necklace and drop earrings. Delicate bead jewelry. "
            "Confetti and stars floating in white background. Sweet and dreamy mood. "
            "Clean anime line art with soft cel shading. Square composition, bust portrait. "
            "No text, no watermarks."
        ),
    },
    "journal": {
        "suffix": "journal",
        "prompt": (
            "Black and white ink line drawing portrait of {figure}, journal sketch style. "
            "Clean confident outlines on off-white paper texture. "
            "Fine hatching for hair and beard/texture detail. "
            "Minimal shading, expressive linework. Period-accurate clothing rendered in simple strokes. "
            "No fill, pure line art. Elegant illustrative style like a field journal or editorial sketch. "
            "Square composition, bust portrait, head and shoulders. "
            "No text, no watermarks, no color."
        ),
    },
}

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
HEADERS = {
    "Content-Type": "application/json",
    "x-freepik-api-key": API_KEY,
}

def safe_filename(name):
    return name.lower().replace(" ", "_")

def generate_and_save(figure, style_name, style_config):
    prompt = style_config["prompt"].format(figure=figure)
    filename = f"{safe_filename(figure)}_{style_config['suffix']}.png"
    output_path = os.path.join(BASE_DIR, style_name, filename)

    if os.path.exists(output_path):
        print(f"  [SKIP] Already exists: {filename}")
        return True

    print(f"  Generating {figure} ({style_name})...", flush=True)
    try:
        response = requests.post(
            API_URL,
            headers=HEADERS,
            json={
                "prompt": prompt,
                "num_images": 1,
                "image": {"size": "square_1_1"},
            },
            timeout=60,
        )
        response.raise_for_status()
        data = response.json()

        img_b64 = data["data"][0]["base64"]
        img_bytes = base64.b64decode(img_b64)

        with open(output_path, "wb") as f:
            f.write(img_bytes)
        print(f"  [OK] Saved: {filename}", flush=True)
        return True

    except Exception as e:
        print(f"  [ERROR] {figure} ({style_name}): {e}", flush=True)
        return False

def main():
    total = len(FIGURES) * len(STYLES)
    done = 0
    failed = []

    for style_name, style_config in STYLES.items():
        print(f"\n=== Style: {style_name.upper()} ===", flush=True)
        for figure in FIGURES:
            success = generate_and_save(figure, style_name, style_config)
            done += 1
            if not success:
                failed.append((figure, style_name))
            print(f"  Progress: {done}/{total}", flush=True)
            if success:
                time.sleep(2)  # small pause to be polite to the API

    print(f"\n=== DONE: {done - len(failed)}/{total} generated ===")
    if failed:
        print("Failed:")
        for fig, sty in failed:
            print(f"  - {fig} ({sty})")

if __name__ == "__main__":
    main()
