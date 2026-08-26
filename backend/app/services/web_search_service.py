import httpx
import logging
from urllib.parse import quote
from app.config import settings

logger = logging.getLogger("darshan.web_search")

async def search_temples_web(query: str):
    clean_query = query.strip()
    web_results = []

    # Option 1: Tavily API if key present
    tavily_key = settings.TAVILY_API_KEY or settings.WEB_SEARCH_API_KEY
    if tavily_key:
        try:
            async with httpx.AsyncClient(timeout=6.0) as client:
                res = await client.post(
                    "https://api.tavily.com/search",
                    json={
                        "api_key": tavily_key,
                        "query": f"{clean_query} temple Tamil Nadu location history",
                        "search_depth": "basic",
                        "max_results": 5
                    }
                )
                if res.status_code == 200:
                    data = res.json()
                    for r in data.get("results", []):
                        web_results.append({
                            "name": r.get("title") or clean_query,
                            "location": "Tamil Nadu, India",
                            "description": r.get("content") or r.get("snippet") or "Real-time temple information.",
                            "source": "Tavily Web Search",
                            "url": r.get("url"),
                            "coverImage": None
                        })
        except Exception as e:
            logger.warning(f"Tavily search exception: {e}")

    # Option 2: Wikipedia Search API fallback
    if not web_results:
        try:
            wiki_search_url = f"https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch={quote(clean_query + ' temple')}&format=json&origin=*"
            headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"}
            async with httpx.AsyncClient(timeout=6.0, headers=headers, follow_redirects=True) as client:
                w_res = await client.get(wiki_search_url)
                if w_res.status_code == 200:
                    w_data = w_res.json()
                    hits = w_data.get("query", {}).get("search", [])
                    for hit in hits[:4]:
                        page_title = hit.get("title")
                        snippet = hit.get("snippet", "").replace("<span class=\"searchmatch\">", "").replace("</span>", "")
                        
                        # Get extract
                        detail_url = f"https://en.wikipedia.org/w/api.php?action=query&prop=extracts|pageimages&exintro=1&explaintext=1&piprop=original&titles={quote(page_title)}&format=json&origin=*"
                        d_res = await client.get(detail_url)
                        if d_res.status_code == 200:
                            d_data = d_res.json()
                            pages = d_data.get("query", {}).get("pages", {})
                            for pid, page in pages.items():
                                if pid != "-1":
                                    web_results.append({
                                        "name": page.get("title"),
                                        "location": "Tamil Nadu, India",
                                        "description": page.get("extract") or snippet,
                                        "source": "Wikipedia",
                                        "url": f"https://en.wikipedia.org/wiki/{quote(page.get('title'))}",
                                        "coverImage": page.get("original", {}).get("source") if isinstance(page.get("original"), dict) else None
                                    })
        except Exception as e:
            logger.warning(f"Wikipedia search exception: {e}")

    # Option 3: OpenStreetMap Nominatim Fallback
    if not web_results:
        try:
            osm_url = f"https://nominatim.openstreetmap.org/search?q={quote(clean_query + ' temple Tamil Nadu')}&format=json&addressdetails=1&limit=3"
            async with httpx.AsyncClient(timeout=6.0, headers={"User-Agent": "DarshanJourneyFastAPI/1.0"}) as client:
                osm_res = await client.get(osm_url)
                if osm_res.status_code == 200:
                    osm_data = osm_res.json()
                    for item in osm_data:
                        name = item.get("name") or item.get("display_name", "").split(",")[0]
                        web_results.append({
                            "name": name,
                            "location": item.get("display_name"),
                            "description": f"Sanctified shrine location: {item.get('display_name')}.",
                            "source": "OpenStreetMap",
                            "url": f"https://www.openstreetmap.org/search?query={quote(item.get('display_name'))}",
                            "coverImage": None
                        })
        except Exception as e:
            logger.warning(f"OSM search exception: {e}")

    return web_results
