import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ---------------- REAL-TIME TEMPLE WEB SEARCH BACKEND ROUTE ----------------
app.post('/api/temples/search-web', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required.'
      });
    }

    const cleanQuery = query.trim();
    const apiKey = process.env.WEB_SEARCH_API_KEY || process.env.TAVILY_API_KEY || process.env.SERPAPI_KEY;

    let webResults = [];

    // Option A: Use Tavily Web Search API if key provided in backend .env
    if (process.env.TAVILY_API_KEY || (process.env.WEB_SEARCH_API_KEY && process.env.WEB_SEARCH_API_KEY.startsWith('tvly-'))) {
      const tavilyKey = process.env.TAVILY_API_KEY || process.env.WEB_SEARCH_API_KEY;
      const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: tavilyKey,
          query: `${cleanQuery} temple Tamil Nadu location history`,
          search_depth: 'basic',
          include_answer: false,
          max_results: 5
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          webResults = data.results.map(r => ({
            name: r.title || cleanQuery,
            location: 'Tamil Nadu, India',
            description: r.content || r.snippet || 'Real-time temple information fetched from web source.',
            source: new URL(r.url).hostname.replace('www.', ''),
            url: r.url
          }));
        }
      }
    }

    // Option B: Real-Time Live Web Search fallback via Wikipedia API & Nominatim OpenStreetMap API
    if (webResults.length === 0) {
      // 1. Query Wikipedia Search API
      const wikiSearchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(cleanQuery + ' temple')}&format=json&origin=*`;
      const wikiRes = await fetch(wikiSearchUrl);
      
      if (wikiRes.ok) {
        const wikiData = await wikiRes.json();
        const searchHits = wikiData.query?.search || [];

        for (const hit of searchHits.slice(0, 4)) {
          const pageTitle = hit.title;
          const snippet = hit.snippet.replace(/<[^>]*>?/gm, ''); // Strip HTML tags
          
          // Get summary extract for page
          const detailUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts|pageimages&exintro=1&explaintext=1&piprop=original&titles=${encodeURIComponent(pageTitle)}&format=json&origin=*`;
          const detailRes = await fetch(detailUrl);
          if (detailRes.ok) {
            const detailData = await detailRes.json();
            const pages = detailData.query?.pages;
            if (pages) {
              const pageId = Object.keys(pages)[0];
              if (pageId !== '-1') {
                const page = pages[pageId];
                webResults.push({
                  name: page.title,
                  location: 'Tamil Nadu, India',
                  description: page.extract || snippet,
                  source: 'Wikipedia',
                  url: `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title)}`,
                  coverImage: page.original?.source || null
                });
              }
            }
          }
        }
      }

      // 2. Query Nominatim OpenStreetMap API for location results if needed
      if (webResults.length === 0) {
        const osmUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cleanQuery + ' temple Tamil Nadu')}&format=json&addressdetails=1&limit=3`;
        const osmRes = await fetch(osmUrl, {
          headers: { 'User-Agent': 'DarshanJourney/1.0 (contact@darshanjourney.com)' }
        });
        if (osmRes.ok) {
          const osmData = await osmRes.json();
          if (Array.isArray(osmData) && osmData.length > 0) {
            webResults = osmData.map(item => ({
              name: item.name || item.display_name.split(',')[0],
              location: item.display_name,
              description: `Sanctified shrine location: ${item.display_name}. Categorized under OpenStreetMap live location registry.`,
              source: 'OpenStreetMap',
              url: `https://www.openstreetmap.org/search?query=${encodeURIComponent(item.display_name)}`
            }));
          }
        }
      }
    }

    if (webResults.length === 0) {
      return res.status(440 || 404).json({
        success: false,
        message: `No real-time web results found for "${cleanQuery}". Please refine your search term.`
      });
    }

    return res.json({
      success: true,
      query: cleanQuery,
      results: webResults
    });

  } catch (error) {
    console.error('Error during real-time temple web search:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to perform real-time web search. Please check server connection and try again.'
    });
  }
});

// Products API route fallback
app.get('/api/products', (req, res) => {
  res.json([]);
});

app.listen(PORT, () => {
  console.log(`✨ Darshan Journey Backend Express Server running on http://localhost:${PORT}`);
});
