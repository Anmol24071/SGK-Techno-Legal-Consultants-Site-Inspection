import { NextResponse } from "next/server";

interface FacilityCategoryDef {
  key: string;
  label: string;
  googleTypes: string[];
  searchTerms: string[];
  fallbackLabel: string;
}

const FACILITY_CATEGORIES: FacilityCategoryDef[] = [
  {
    key: "railway_station",
    label: "Nearest Railway Station",
    googleTypes: ["train_station", "transit_station"],
    searchTerms: ["railway station", "train station", "station"],
    fallbackLabel: "Railway Station",
  },
  {
    key: "bus_stop",
    label: "Nearest Bus Stop",
    googleTypes: ["bus_station", "bus_stop", "transit_station"],
    searchTerms: ["bus stop", "bus station", "bus stand", "depot"],
    fallbackLabel: "Bus Stop / Stand",
  },
  {
    key: "market",
    label: "Nearest Market",
    googleTypes: ["supermarket", "grocery_store", "market"],
    searchTerms: ["supermarket", "market", "bazaar", "d mart", "grocery"],
    fallbackLabel: "Market / Supermarket",
  },
  {
    key: "shopping_mall",
    label: "Nearest Shopping Mall",
    googleTypes: ["shopping_mall"],
    searchTerms: ["shopping mall", "mall", "shopping center", "commercial center"],
    fallbackLabel: "Shopping Mall",
  },
  {
    key: "cinema_hall",
    label: "Nearest Cinema Hall",
    googleTypes: ["movie_theater"],
    searchTerms: ["cinema", "multiplex", "movie theater", "theatre"],
    fallbackLabel: "Cinema Hall",
  },
  {
    key: "school",
    label: "Nearest School",
    googleTypes: ["school", "primary_school", "secondary_school"],
    searchTerms: ["school", "high school", "vidyalaya", "academy"],
    fallbackLabel: "High School",
  },
  {
    key: "college",
    label: "Nearest College",
    googleTypes: ["university"],
    searchTerms: ["college", "junior college", "degree college", "university", "institute"],
    fallbackLabel: "College",
  },
  {
    key: "hospital",
    label: "Nearest Hospital",
    googleTypes: ["hospital"],
    searchTerms: ["hospital", "nursing home", "clinic", "health center"],
    fallbackLabel: "Hospital / Clinic",
  },
  {
    key: "govt_office",
    label: "Distance from Government Office",
    googleTypes: ["city_hall", "local_government_office", "courthouse"],
    searchTerms: ["post office", "municipal office", "government office", "tehsildar", "ward office"],
    fallbackLabel: "Government Office",
  },
  {
    key: "police_station",
    label: "Distance from Police Station",
    googleTypes: ["police"],
    searchTerms: ["police station", "police chowki", "police outpost"],
    fallbackLabel: "Police Station",
  },
  {
    key: "auto_stand",
    label: "Distance from Auto Stand",
    googleTypes: ["taxi_stand", "transit_station"],
    searchTerms: ["auto stand", "rickshaw stand", "taxi stand"],
    fallbackLabel: "Auto Rickshaw Stand",
  },
];

function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const meters = Math.round(R * c);

  let text = `${meters} m`;
  let numericDistance = meters;
  let unit = "m";

  if (meters >= 1000) {
    numericDistance = parseFloat((meters / 1000).toFixed(1));
    text = `${numericDistance} km`;
    unit = "km";
  }

  return { meters, numericDistance, text, unit };
}

// 1. Google Places Legacy / New API (used if API key is active with billing)
async function fetchFromGoogle(apiKey: string, lat: number, lng: number, type: string) {
  try {
    const legacyUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=8000&type=${type}&key=${apiKey}`;
    const res = await fetch(legacyUrl);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.status === "OK" && data.results && data.results.length > 0) {
      return data.results;
    }
  } catch (err) {
    console.error("Google Legacy Places error:", err);
  }
  return null;
}

// 2. Real POI search via Photon Komoot (OpenStreetMap Real POI DB)
async function fetchRealPoiFromPhoton(terms: string[], lat: number, lng: number) {
  for (const term of terms) {
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(term)}&lat=${lat}&lon=${lng}`;
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "SGKTechnoLegalConsultantsApp/1.0" },
      });
      if (res.ok) {
        const data = await res.json();
        const features = data.features || [];
        const candidates: any[] = [];

        for (const f of features) {
          const coords = f.geometry?.coordinates;
          if (!coords || coords.length < 2) continue;
          const pLat = coords[1];
          const pLng = coords[0];
          const distObj = calculateHaversineDistance(lat, lng, pLat, pLng);
          const name = f.properties?.name;

          // Accept only real named places within 25 km, excluding generic road names
          if (
            name &&
            distObj.meters <= 25000 &&
            !name.toLowerCase().endsWith("road") &&
            !name.toLowerCase().endsWith("marg")
          ) {
            const street = f.properties.street;
            const city =
              f.properties.city || f.properties.district || f.properties.county || f.properties.state || "";
            const address = [street, city, f.properties.state].filter(Boolean).join(", ");
            candidates.push({
              name,
              pLat,
              pLng,
              distObj,
              address: address || `${city}`,
              osmId: f.properties.osm_id,
            });
          }
        }

        if (candidates.length > 0) {
          candidates.sort((a, b) => a.distObj.meters - b.distObj.meters);
          return candidates[0];
        }
      }
    } catch (e) {
      console.error(`Photon search error for term "${term}":`, e);
    }
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GOOGLE_MAPS_SERVER_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
    const body = await req.json();
    const { latitude, longitude } = body;

    if (latitude === undefined || longitude === undefined || isNaN(Number(latitude)) || isNaN(Number(longitude))) {
      return NextResponse.json({ error: "Valid latitude and longitude are required." }, { status: 400 });
    }

    const lat = Number(latitude);
    const lng = Number(longitude);

    // Get Locality / City Name via BigDataCloud (<150ms)
    let cityName = "Local Area";
    try {
      const revRes = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      );
      if (revRes.ok) {
        const revData = await revRes.json();
        cityName =
          revData.city ||
          revData.locality ||
          revData.localityInfo?.administrative?.find((a: any) => a.adminLevel === 6 || a.adminLevel === 8)?.name ||
          "Local Area";
      }
    } catch (e) {
      console.error("BigDataCloud reverse geocode error:", e);
    }

    const results = [];

    for (const cat of FACILITY_CATEGORIES) {
      let foundFacility: any = null;

      // 1. Google Places API
      if (apiKey) {
        for (const gType of cat.googleTypes) {
          const gPlaces = await fetchFromGoogle(apiKey, lat, lng, gType);
          if (gPlaces && gPlaces.length > 0) {
            const top = gPlaces[0];
            const pLat = top.geometry?.location?.lat;
            const pLng = top.geometry?.location?.lng;
            const distObj =
              pLat && pLng
                ? calculateHaversineDistance(lat, lng, pLat, pLng)
                : { meters: 500, numericDistance: 0.5, text: "0.5 km", unit: "km" };

            foundFacility = {
              facilityKey: cat.key,
              facilityLabel: cat.label,
              placeName: top.name,
              placeId: top.place_id || null,
              address: top.vicinity || top.formatted_address || `${cityName}`,
              latitude: pLat || null,
              longitude: pLng || null,
              distance: distObj.numericDistance,
              distanceText: distObj.text,
              unit: distObj.unit,
              selectionMethod: "AUTOMATIC",
              retrievedAt: new Date().toISOString(),
              found: true,
            };
            break;
          }
        }
      }

      // 2. Real POI Search via Photon OpenStreetMap
      if (!foundFacility) {
        const realPoi = await fetchRealPoiFromPhoton(cat.searchTerms, lat, lng);
        if (realPoi) {
          foundFacility = {
            facilityKey: cat.key,
            facilityLabel: cat.label,
            placeName: realPoi.name,
            placeId: realPoi.osmId ? String(realPoi.osmId) : null,
            address: realPoi.address,
            latitude: realPoi.pLat,
            longitude: realPoi.pLng,
            distance: realPoi.distObj.numericDistance,
            distanceText: realPoi.distObj.text,
            unit: realPoi.distObj.unit,
            selectionMethod: "AUTOMATIC",
            retrievedAt: new Date().toISOString(),
            found: true,
          };
        }
      }

      // 3. Explicit No Facility Found Fallback (No fake / random names!)
      if (!foundFacility) {
        foundFacility = {
          facilityKey: cat.key,
          facilityLabel: cat.label,
          placeName: "No nearby facility found",
          placeId: null,
          address: `No nearby ${cat.label.toLowerCase()} found within 15 km in ${cityName}.`,
          latitude: null,
          longitude: null,
          distance: null,
          distanceText: "No nearby facility found",
          unit: "km",
          selectionMethod: "AUTOMATIC",
          retrievedAt: new Date().toISOString(),
          found: false,
        };
      }

      results.push(foundFacility);
    }

    return NextResponse.json({ success: true, facilities: results });
  } catch (err: any) {
    console.error("Nearby facility API error:", err);
    return NextResponse.json({ error: err.message || "Failed to search nearby facilities" }, { status: 500 });
  }
}
