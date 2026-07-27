// Search Utility for Fast Typo-Tolerant Search & Instant Suggestions

/**
 * Calculates Levenshtein Distance between two strings for typo tolerance.
 */
export function getLevenshteinDistance(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return 999;
  const str1 = a.toLowerCase();
  const str2 = b.toLowerCase();
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i += 1) {
    matrix[0][i] = i;
  }
  for (let j = 0; j <= str2.length; j += 1) {
    matrix[j][0] = j;
  }

  for (let j = 1; j <= str2.length; j += 1) {
    for (let i = 1; i <= str1.length; i += 1) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * Checks if a search query fuzzy matches a target string.
 * Supports partial matching, prefix matching, word tokens, and edit-distance typo tolerance (up to 2 typos).
 * Guaranteed never to throw null/undefined errors or JS exceptions.
 */
export function isFuzzyMatch(target, query) {
  if (!query || String(query).trim().length === 0) return true;
  if (!target || String(target).trim().length === 0) return false;

  try {
    const q = String(query).toLowerCase().trim();
    const t = String(target).toLowerCase().trim();

    // 1. Direct substring match (fastest)
    if (t.includes(q)) return true;

    // 2. Token / word-level match
    const qTokens = q.split(/\s+/).filter(Boolean);
    const tTokens = t.split(/\s+/).filter(Boolean);

    const allTokensMatch = qTokens.every(qToken => {
      return tTokens.some(tToken => {
        if (tToken.includes(qToken)) return true;
        // Allow 1 typo for short words (>=4 chars), 2 typos for long words (>=7 chars)
        const maxAllowed = qToken.length >= 7 ? 2 : qToken.length >= 4 ? 1 : 0;
        if (maxAllowed > 0 && Math.abs(tToken.length - qToken.length) <= maxAllowed) {
          const dist = getLevenshteinDistance(tToken, qToken);
          return dist <= maxAllowed;
        }
        return false;
      });
    });

    return allTokensMatch;
  } catch (err) {
    console.error("Error in isFuzzyMatch:", err);
    return false;
  }
}

/**
 * Generates instant auto-complete suggestions from temples list based on user query.
 * Guaranteed never to crash or throw JS exceptions.
 */
export function getInstantSuggestions(templesList, query, maxSuggestions = 6) {
  if (!query || String(query).trim().length === 0 || !Array.isArray(templesList)) return [];

  try {
    const q = String(query).toLowerCase().trim();
    const matches = [];

    templesList.forEach(temple => {
      if (!temple) return;

      const name = temple.name ? String(temple.name).toLowerCase() : '';
      const district = temple.district ? String(temple.district).toLowerCase() : '';
      const location = temple.location ? String(temple.location).toLowerCase() : (temple.address ? String(temple.address).toLowerCase() : '');
      const category = temple.category ? String(temple.category).toLowerCase() : (temple.deityCategory ? String(temple.deityCategory).toLowerCase() : '');
      const deityLabel = temple.deityLabel ? String(temple.deityLabel).toLowerCase() : '';

      const nameMatch = name.includes(q);
      const districtMatch = district.includes(q);
      const locationMatch = location.includes(q);
      const categoryMatch = category.includes(q) || deityLabel.includes(q);

      let score = 0;
      if (name.startsWith(q)) score += 100;
      else if (nameMatch) score += 80;
      else if (districtMatch) score += 50;
      else if (locationMatch) score += 40;
      else if (categoryMatch) score += 30;
      else if (isFuzzyMatch(name, q) || isFuzzyMatch(location, q) || isFuzzyMatch(district, q)) score += 20;

      if (score > 0) {
        matches.push({ temple, score });
      }
    });

    return matches
      .sort((a, b) => b.score - a.score)
      .slice(0, maxSuggestions)
      .map(item => item.temple);
  } catch (err) {
    console.error("Error in getInstantSuggestions:", err);
    return [];
  }
}
