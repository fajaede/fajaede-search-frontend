"""Een eenvoudig script om de /search API endpoint te testen.

Dit script voert een reeks vooraf gedefinieerde zoekopdrachten uit en drukt
statistieken af over de ontvangen resultaten, zoals het totale aantal,
en het aantal resultaten met afbeeldingen of video's.
"""

import urllib.request
import urllib.parse
import json
import os

API_BASE_URL = os.getenv("API_URL", "http://127.0.0.1:18000")
queries = ["europa", "nieuws", "geld", "fajaede.nl", "rotterdam"]

for q in queries:
    print(f"=== Query: {q} ===")
    try:
        url = f"{API_BASE_URL}/search?" + urllib.parse.urlencode({"q": q, "limit": 50})
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req) as response:
            if response.status == 200:
                data = json.loads(response.read().decode('utf-8'))
                results = data.get("results", [])
                images = [res for res in results if res.get("image_url")]
                videos = [res for res in results if res.get("video_url")]
                print(f"Total results: {len(results)}")
                print(f"With image_url: {len(images)}")
                print(f"With video_url: {len(videos)}")
                if images:
                    print("First image:", images[0]["image_url"])
                if videos:
                    print("First video:", videos[0]["video_url"])
            else:
                print(f"Error {response.status}")
    # Vang specifieke fouten af voor betere foutafhandeling.
    except (urllib.error.URLError, json.JSONDecodeError) as e:
        print(f"Request failed for query '{q}': {e}")
