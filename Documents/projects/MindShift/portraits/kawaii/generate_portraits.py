#!/usr/bin/env python3
import requests
import base64
import json
import time
import os

API_KEY = "FPSXabe41fd7997856e9141bec25c8a499d4"
API_URL = "https://api.freepik.com/v1/ai/text-to-image"
OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))

PORTRAITS = [
    {
        "filename": "Napoleon_Kawaii.png",
        "prompt": "kawaii anime chibi portrait of Napoleon Bonaparte, short stature, dark brown hair styled in historical military fashion, dark brown eyes, wearing iconic bicorne hat and blue French imperial military uniform with gold medals and epaulettes, rosy blushing cheeks, large sparkly shiny anime eyes with highlight reflections, watercolor soft pastel texture, thematic background with golden stars hearts confetti on cream background, cute chibi kawaii style, soft pastel colors, anime illustration"
    },
    {
        "filename": "Trump_Kawaii.png",
        "prompt": "kawaii anime chibi portrait of Donald Trump, blonde swept hair, blue eyes, orange-tinted peachy skin, wearing dark navy suit with red tie, rosy blushing cheeks, large sparkly shiny anime eyes with highlight reflections, watercolor soft pastel texture, thematic background with golden stars confetti on white background, cute chibi kawaii style, soft pastel colors, anime illustration, American flag faint in background"
    },
    {
        "filename": "Socrates_Kawaii.png",
        "prompt": "kawaii anime chibi portrait of ancient Greek philosopher Socrates, bald head with short curly grey beard, grey eyes, wearing draped white Greek toga robe, rosy blushing cheeks, large sparkly shiny anime eyes with highlight reflections, watercolor soft pastel texture, thematic background with golden stars hearts confetti on pale blue background, ancient Greek columns and laurel leaves, cute chibi kawaii style, soft pastel colors, anime illustration"
    },
    {
        "filename": "Lincoln_Kawaii.png",
        "prompt": "kawaii anime chibi portrait of Abraham Lincoln, dark brown wavy hair, grey-blue eyes, full beard without mustache, wearing black suit with bow tie, tall stovepipe top hat, rosy blushing cheeks, large sparkly shiny anime eyes with highlight reflections, watercolor soft pastel texture, thematic background with golden stars hearts confetti, faint American flag, cute chibi kawaii style, soft pastel colors, anime illustration"
    },
    {
        "filename": "DollyParton_Kawaii.png",
        "prompt": "kawaii anime chibi portrait of Dolly Parton, big voluminous curly blonde hair, blue eyes, wearing sparkling rhinestone pink country outfit with fringe, big smile, star earrings, rosy blushing cheeks, large sparkly shiny anime eyes with highlight reflections, watercolor soft pastel texture, thematic background with pink stars hearts confetti on pastel pink background, cute chibi kawaii style, soft pastel colors, anime illustration"
    },
    {
        "filename": "FridaKahlo_Kawaii.png",
        "prompt": "kawaii anime chibi portrait of Frida Kahlo, dark black braided hair adorned with colorful flowers, dark brown eyes, distinctive unibrow, wearing traditional Mexican Tehuana embroidered blouse with colorful flowers, rosy blushing cheeks, large sparkly shiny anime eyes with highlight reflections, watercolor soft pastel texture, thematic background with golden stars colorful flowers confetti on warm yellow background, cute chibi kawaii style, soft pastel colors, anime illustration"
    },
    {
        "filename": "MayaAngelou_Kawaii.png",
        "prompt": "kawaii anime chibi portrait of Maya Angelou, elegant dark brown natural hair, warm brown eyes, wearing a colorful African-inspired head wrap turban and elegant blouse, warm confident smile, rosy blushing cheeks, large sparkly shiny anime eyes with highlight reflections, watercolor soft pastel texture, thematic background with golden stars hearts confetti on soft purple background, cute chibi kawaii style, soft pastel colors, anime illustration"
    },
    {
        "filename": "SalvadorDali_Kawaii.png",
        "prompt": "kawaii anime chibi portrait of Salvador Dali, dark slicked back hair, dramatic upturned curled mustache, brown eyes, wearing an artist smock with a cravat necktie, holding a paintbrush, rosy blushing cheeks, large sparkly shiny anime eyes with highlight reflections, watercolor soft pastel texture, thematic background with surreal melting clocks stars hearts confetti, cute chibi kawaii style, soft pastel colors, anime illustration"
    },
    {
        "filename": "NelsonMandela_Kawaii.png",
        "prompt": "kawaii anime chibi portrait of Nelson Mandela, short grey hair, warm brown eyes, wearing a colorful Madiba pattern shirt in vibrant batik colors with geometric African patterns, warm kind smile, rosy blushing cheeks, large sparkly shiny anime eyes with highlight reflections, watercolor soft pastel texture, thematic background with golden stars hearts confetti on warm orange and green background, cute chibi kawaii style, soft pastel colors, anime illustration"
    },
    {
        "filename": "ChuckNorris_Kawaii.png",
        "prompt": "kawaii anime chibi portrait of Chuck Norris, brown short hair, blue eyes, full thick beard, wearing a martial arts gi karate uniform, strong confident expression, rosy blushing cheeks, large sparkly shiny anime eyes with highlight reflections, watercolor soft pastel texture, thematic background with golden stars confetti on action-themed background, cute chibi kawaii style, soft pastel colors, anime illustration"
    },
    {
        "filename": "ChingShih_Kawaii.png",
        "prompt": "kawaii anime chibi portrait of Ching Shih legendary female Chinese pirate, long black hair partially tied up, dark brown eyes, wearing traditional Chinese pirate outfit with red and black colors, fierce determined expression, rosy blushing cheeks, large sparkly shiny anime eyes with highlight reflections, watercolor soft pastel texture, thematic background with golden stars ocean waves confetti on turquoise background, cute chibi kawaii style, soft pastel colors, anime illustration"
    },
    {
        "filename": "RosaParks_Kawaii.png",
        "prompt": "kawaii anime chibi portrait of Rosa Parks, dark black hair neatly styled, warm brown eyes, wearing a modest 1950s style dress and coat with cat-eye glasses, warm dignified smile, rosy blushing cheeks, large sparkly shiny anime eyes with highlight reflections, watercolor soft pastel texture, thematic background with golden stars hearts confetti on soft blue background, cute chibi kawaii style, soft pastel colors, anime illustration"
    },
    {
        "filename": "Gandhi_Kawaii.png",
        "prompt": "kawaii anime chibi portrait of Mahatma Gandhi, bald head with small round wire-framed glasses, dark brown eyes, wearing traditional simple white dhoti and shawl, warm peaceful smile, rosy blushing cheeks, large sparkly shiny anime eyes with highlight reflections, watercolor soft pastel texture, thematic background with golden stars lotus flowers confetti on warm golden background, cute chibi kawaii style, soft pastel colors, anime illustration"
    },
    {
        "filename": "CheGuevara_Kawaii.png",
        "prompt": "kawaii anime chibi portrait of Che Guevara, dark black wavy hair, dark brown eyes, wearing iconic olive military beret with red star, olive green military jacket, short beard, rosy blushing cheeks, large sparkly shiny anime eyes with highlight reflections, watercolor soft pastel texture, thematic background with golden stars confetti on red and green background, cute chibi kawaii style, soft pastel colors, anime illustration"
    },
]

def generate_portrait(person):
    print(f"Generating: {person['filename']}...")

    payload = {
        "prompt": person["prompt"],
        "negative_prompt": "realistic, photorealistic, ugly, distorted, nsfw, adult, low quality, blurry, deformed, extra limbs",
        "num_images": 1,
        "image": {"size": "portrait_4_3"},
        "styling": {
            "style": "anime",
            "color": "pastel",
            "lightning": "soft",
            "framing": "portrait"
        }
    }

    headers = {
        "x-freepik-api-key": API_KEY,
        "Content-Type": "application/json"
    }

    response = requests.post(API_URL, headers=headers, json=payload)

    if response.status_code != 200:
        print(f"  ERROR {response.status_code}: {response.text[:200]}")
        return False

    data = response.json()

    if "data" not in data or not data["data"]:
        print(f"  ERROR: No image data in response")
        return False

    b64_image = data["data"][0].get("base64") or data["data"][0].get("url")

    if not b64_image:
        print(f"  ERROR: No base64 data found. Keys: {list(data['data'][0].keys())}")
        return False

    # Decode and save
    img_data = base64.b64decode(b64_image)
    output_path = os.path.join(OUTPUT_DIR, person["filename"])

    with open(output_path, "wb") as f:
        f.write(img_data)

    print(f"  Saved: {output_path}")
    return True

def main():
    # Check which ones already exist
    existing = {"Lenin_Kawaii.png", "Lincoln_Kawaii.png", "Parton_Kawaii.png", "Trum_Kawaii.png"}

    to_generate = [p for p in PORTRAITS if p["filename"] not in existing]
    already_done = [p for p in PORTRAITS if p["filename"] in existing]

    print(f"Already have: {[p['filename'] for p in already_done]}")
    print(f"Generating {len(to_generate)} new portraits...\n")

    success = 0
    failed = []

    for i, person in enumerate(to_generate):
        result = generate_portrait(person)
        if result:
            success += 1
        else:
            failed.append(person["filename"])

        # Rate limit pause between requests
        if i < len(to_generate) - 1:
            time.sleep(2)

    print(f"\nDone! Generated {success}/{len(to_generate)} portraits.")
    if failed:
        print(f"Failed: {failed}")

if __name__ == "__main__":
    main()
