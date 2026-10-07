/* ══════════════════════════════════════════════════════════════
   INTERNAL LINKING MAP — Tour ↔ Blog ↔ Related Tours
   VERSION 2 — bebe links isaky ny tour
══════════════════════════════════════════════════════════════ */

export const TOUR_TO_BLOG = {
  "western-1d": [
    "best-time-visit-avenue-baobabs-madagascar",
    "what-to-pack-madagascar-safari",
    "madagascar-itinerary-from-morondava",
  ],
  "kirindy-1d": [
    "kirindy-forest-fossa-lemurs-guide",
    "what-to-pack-madagascar-safari",
    "best-time-visit-avenue-baobabs-madagascar",
  ],
  "kirindy-2d": [
    "kirindy-forest-fossa-lemurs-guide",
    "what-to-pack-madagascar-safari",
    "madagascar-itinerary-from-morondava",
  ],
  "tsingy-3d": [
    "tsingy-de-bemaraha-travel-guide",
    "what-to-pack-madagascar-safari",
    "madagascar-itinerary-from-morondava",
  ],
  "tsingy-4d": [
    "tsingy-de-bemaraha-travel-guide",
    "best-time-visit-avenue-baobabs-madagascar",
    "what-to-pack-madagascar-safari",
  ],
  "tsiribihina-3d": [
    "tsiribihina-river-descent-complete-guide",
    "what-to-pack-madagascar-safari",
    "madagascar-itinerary-from-morondava",
  ],
  "tsiribihina-4d": [
    "tsiribihina-river-descent-complete-guide",
    "kirindy-forest-fossa-lemurs-guide",
    "what-to-pack-madagascar-safari",
  ],
  "tsiribihina-5d": [
    "tsiribihina-river-descent-complete-guide",
    "madagascar-itinerary-from-morondava",
    "what-to-pack-madagascar-safari",
  ],
  "tsiribihina-6d": [
    "tsiribihina-river-descent-complete-guide",
    "tsingy-de-bemaraha-travel-guide",
    "what-to-pack-madagascar-safari",
  ],
  "tsiribihina-8d": [
    "madagascar-itinerary-from-morondava",
    "what-to-pack-madagascar-safari",
    "tsiribihina-river-descent-complete-guide",
  ],
  "andasibe-3d": [
    "madagascar-itinerary-from-morondava",
    "what-to-pack-madagascar-safari",
    "kirindy-forest-fossa-lemurs-guide",
  ],
  "andasibe-4d": [
    "madagascar-itinerary-from-morondava",
    "what-to-pack-madagascar-safari",
    "kirindy-forest-fossa-lemurs-guide",
  ],
  "andasibe-5d": [
    "madagascar-itinerary-from-morondava",
    "what-to-pack-madagascar-safari",
    "tsingy-de-bemaraha-travel-guide",
  ],
  "andasibe-palmarium": [
    "madagascar-itinerary-from-morondava",
    "what-to-pack-madagascar-safari",
    "kirindy-forest-fossa-lemurs-guide",
  ],
};

export const BLOG_TO_MORE_TOURS = {
  "best-time-visit-avenue-baobabs-madagascar": ["kirindy-1d", "kirindy-2d"],
  "tsingy-de-bemaraha-travel-guide":            ["tsingy-3d", "kirindy-2d"],
  "kirindy-forest-fossa-lemurs-guide":          ["kirindy-1d", "western-1d"],
  "tsiribihina-river-descent-complete-guide":   ["tsiribihina-4d", "tsiribihina-6d"],
  "madagascar-itinerary-from-morondava":        ["tsiribihina-5d", "tsingy-4d"],
  "what-to-pack-madagascar-safari":             ["tsingy-4d", "kirindy-2d"],
};