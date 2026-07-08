import urllib.request
import urllib.parse
import json

queries = ["europa", "nieuws", "geld", "fajaede.nl", "rotterdam"]
for q in queries:
    print(f"=== Query: {q} ===")
    try:
        url = "http://116.203.39.166:18000/search?" + urllib.parse.urlencode({"q": q, "limit": 50})
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
    except Exception as e:
        print(f"Failed: {e}")
