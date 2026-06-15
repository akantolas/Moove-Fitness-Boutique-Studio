/**
 * Vercel serverless: φέρνει κριτικές μέσω Google Places API (New).
 *
 * Env (Vercel → Project → Settings → Environment Variables):
 *   GOOGLE_PLACES_API_KEY  — API key (restrict σε Places API, χωρίς browser)
 *
 * Προαιρετικά:
 *   GOOGLE_PLACES_SEARCH_TEXT — default: Moove Volos
 *   GOOGLE_PLACE_RESOURCE_NAME — π.χ. places/ChIJ... για να παραλείψεις το search
 *
 * Ενεργοποίηση billing + "Places API (New)" στο Google Cloud Console.
 * @see https://developers.google.com/maps/documentation/places/web-service/op-overview
 */

const DEFAULT_QUERY = 'Moove Fitness Boutique Studio Κοραή Βόλος'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'method_not_allowed' })
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) {
    return res.status(200).json({
      ok: false,
      error: 'missing_api_key',
      aggregateRating: null,
      reviewCount: null,
      googleMapsUri: null,
      reviews: [],
    })
  }

  try {
    let placeName = process.env.GOOGLE_PLACE_RESOURCE_NAME?.trim()

    if (!placeName) {
      const q =
        process.env.GOOGLE_PLACES_SEARCH_TEXT?.trim() || DEFAULT_QUERY
      const searchRes = await fetch(
        'https://places.googleapis.com/v1/places:searchText',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': apiKey,
            'X-Goog-FieldMask': 'places.name',
          },
          body: JSON.stringify({
            textQuery: q,
            languageCode: 'el',
            locationBias: {
              circle: {
                center: { latitude: 39.3670204, longitude: 22.9482246 },
                radius: 400,
              },
            },
          }),
        },
      )

      if (!searchRes.ok) {
        const detail = await searchRes.text()
        return res.status(502).json({
          ok: false,
          error: 'places_search_failed',
          detail: detail.slice(0, 500),
          reviews: [],
        })
      }

      const searchJson = await searchRes.json()
      const first = searchJson.places?.[0]
      if (!first?.name) {
        return res.status(200).json({
          ok: false,
          error: 'place_not_found',
          reviews: [],
        })
      }
      placeName = first.name
    }

    const placeId = placeName.replace(/^places\//, '')
    const detailsRes = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,
      {
        headers: {
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask':
            'displayName,rating,userRatingCount,googleMapsUri,reviews',
        },
      },
    )

    if (!detailsRes.ok) {
      const detail = await detailsRes.text()
      return res.status(502).json({
        ok: false,
        error: 'place_details_failed',
        detail: detail.slice(0, 500),
        reviews: [],
      })
    }

    const p = await detailsRes.json()
    const raw = Array.isArray(p.reviews) ? p.reviews : []
    const reviews = raw.slice(0, 8).map((r) => ({
      author: r.authorAttribution?.displayName ?? 'Google user',
      authorUri: r.authorAttribution?.uri ?? null,
      rating: typeof r.rating === 'number' ? r.rating : null,
      text: r.text?.text ?? '',
      time: r.relativePublishTimeDescription ?? '',
    }))

    return res.status(200).json({
      ok: true,
      displayName: p.displayName?.text ?? null,
      aggregateRating: typeof p.rating === 'number' ? p.rating : null,
      reviewCount:
        typeof p.userRatingCount === 'number' ? p.userRatingCount : null,
      googleMapsUri: p.googleMapsUri ?? null,
      reviews,
    })
  } catch (e) {
    return res.status(500).json({
      ok: false,
      error: 'server_error',
      message: e instanceof Error ? e.message : 'unknown',
      reviews: [],
    })
  }
}
