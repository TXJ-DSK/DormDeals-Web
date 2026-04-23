import type { Map as LeafletMap, Marker } from 'leaflet';
import React, { useEffect, useRef, useState } from 'react';

import center from '../favicon/center.png';
import { Listing } from '../types/Listing';

declare global {
  interface Window {
    L: typeof import('leaflet');
  }
}

interface MapViewProps {
  listings: Listing[];
  onSelectListing: (listing: Listing) => void;
  searchQuery?: string;
  selectedFurnitureTypes?: string[];
  maxPrice?: number | string;
  minConditionIndex?: number;
  maxConditionIndex?: number;
  conditions?: string[];
  isActive?: boolean;
}

function haversineMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const geocodeCache = new Map<string, { lat: number; lon: number } | null>();

// Evanston, IL coordinates for location bias
const EVANSTON_LAT = 42.0451;
const EVANSTON_LON = -87.6877;

async function geocode(location: string): Promise<{ lat: number; lon: number } | null> {
  const query = /evanston|chicago|illinois|il\b/i.test(location)
    ? location
    : `${location}, Evanston, IL`;

  if (geocodeCache.has(query)) return geocodeCache.get(query)!;

  try {
    // Photon: CORS-friendly, free, no key, biased to Evanston via lat/lon
    const url =
      `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=1` +
      `&lat=${EVANSTON_LAT}&lon=${EVANSTON_LON}&lang=en`;

    const res = await fetch(url);
    const data = await res.json();

    const feature = data?.features?.[0];
    const result = feature
      ? { lat: feature.geometry.coordinates[1], lon: feature.geometry.coordinates[0] }
      : null;

    geocodeCache.set(query, result);
    return result;
  } catch {
    geocodeCache.set(query, null);
    return null;
  }
}

interface GeocodedListing {
  listing: Listing;
  coords: { lat: number; lon: number } | null;
}

const MapView: React.FC<MapViewProps> = ({
  listings,
  onSelectListing,
  searchQuery = '',
  selectedFurnitureTypes = [],
  maxPrice = '',
  minConditionIndex = 0,
  maxConditionIndex = 4,
  conditions = ['New', 'Like New', 'Good', 'Fair', 'Poor'],
  isActive = true,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const geocodedListingsRef = useRef<GeocodedListing[]>([]);
  const markersRef = useRef<Marker[]>([]);
  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [status, setStatus] = useState<string>('Requesting your location…');
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  const userCoordsRef = useRef<{ lat: number; lon: number } | null>(null);

  // Filter listings the same way as in App.tsx
  const filteredListings = listings.filter((listing) => {
    const query = searchQuery.toLowerCase();
    const inText =
      listing.title.toLowerCase().includes(query) ||
      listing.description.toLowerCase().includes(query) ||
      listing.location.toLowerCase().includes(query) ||
      listing.furnitureType.toLowerCase().includes(query);

    const typeFilter =
      selectedFurnitureTypes.length === 0 ||
      selectedFurnitureTypes.includes(listing.furnitureType);

    const priceFilter = !maxPrice || listing.price <= parseFloat(maxPrice as string);

    const conditionIndex = conditions.indexOf(listing.condition);
    const conditionFilter =
      conditionIndex >= minConditionIndex && conditionIndex <= maxConditionIndex;

    return inText && typeFilter && priceFilter && conditionFilter;
  });

  // Load Leaflet CSS + JS once
  useEffect(() => {
    if (document.getElementById('leaflet-css')) {
      if (window.L) setLeafletLoaded(true);
      return;
    }
    const link = document.createElement('link');
    link.id = 'leaflet-css';
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    script.crossOrigin = 'anonymous';
    script.onload = () => setLeafletLoaded(true);
    document.head.appendChild(script);
  }, []);

  // Get user geolocation
  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setUserCoords(null);
      setStatus('Location unavailable. Showing default area.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        setUserCoords(coords);
        userCoordsRef.current = coords;
        setStatus('');
      },
      () => {
        setUserCoords(null);
        setStatus('Location unavailable. Showing default area.');
      },
    );
  }, []);

  // Init map once
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current) return;

    const L = window.L;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const defaultCenter: [number, number] = userCoords
      ? [userCoords.lat, userCoords.lon]
      : [42.0451, -87.6877];

    const map = L.map(mapRef.current).setView(defaultCenter, 13);
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Blue dot for user's location
    if (userCoords) {
      const userIcon = L.divIcon({
        className: '',
        html: `<div style="
          width:14px;height:14px;
          background:#3b82f6;
          border:3px solid #fff;
          border-radius:50%;
          box-shadow:0 0 0 3px rgba(59,130,246,0.35);
        "></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });
      L.marker([userCoords.lat, userCoords.lon], { icon: userIcon })
        .addTo(map)
        .bindPopup('<strong>📍 You are here</strong>');
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [leafletLoaded, userCoords]);

  // Geocode ALL listings once (only when listings array changes AND map view is active)
  useEffect(() => {
    if (!leafletLoaded || !isActive) return;

    setStatus('Plotting listings…');

    (async () => {
      try {
        if (listings.length === 0) {
          geocodedListingsRef.current = [];
          setStatus('');
          return;
        }

        // Stagger requests 200ms apart to avoid rate limiting
        const geocoded: GeocodedListing[] = [];
        for (let i = 0; i < listings.length; i++) {
          if (i > 0) await new Promise((r) => setTimeout(r, 200));
          const coords = await geocode(listings[i].location);
          geocoded.push({ listing: listings[i], coords });
        }

        geocodedListingsRef.current = geocoded;
        setStatus('');
      } catch (error) {
        console.error('Error geocoding listings:', error);
        setStatus('');
      }
    })();
  }, [listings, leafletLoaded, isActive]);

  // Update map markers based on filtered listings (runs when filters change, NOT when geocoding)
  useEffect(() => {
    if (!mapInstanceRef.current || !window.L) return;

    const L = window.L;
    const map = mapInstanceRef.current;

    // Remove old markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add markers for filtered listings
    const filteredGeocodedListings = geocodedListingsRef.current.filter((item) =>
      filteredListings.some((fl) => fl.id === item.listing.id),
    );

    for (const { listing, coords } of filteredGeocodedListings) {
      if (!coords) continue;

      const distanceLine = userCoords
        ? `<br/><span style="color:#6b7280;font-size:12px;">📏 ${haversineMiles(
            userCoords.lat,
            userCoords.lon,
            coords.lat,
            coords.lon,
          ).toFixed(1)} miles away</span>`
        : '';

      const pinIcon = L.divIcon({
        className: '',
        html: `<div style="
                background:#1e293b;
                color:#fff;
                border-radius:8px;
                padding:4px 10px;
                font-size:12px;
                font-weight:600;
                white-space:nowrap;
                box-shadow:0 2px 8px rgba(0,0,0,0.35);
                border:2px solid #3b82f6;
                display:inline-block;
            ">$${listing.price}</div>`,
        iconSize: undefined,
        iconAnchor: undefined,
        popupAnchor: [0, -10],
      });

      const marker = L.marker([coords.lat, coords.lon], { icon: pinIcon }).addTo(map);
      markersRef.current.push(marker);

      marker.bindPopup(`
        <div style="min-width:180px">
            <strong style="font-size:14px">${listing.title}</strong><br/>
            <span style="color:#3b82f6;font-weight:600">$${listing.price}</span>
            &nbsp;·&nbsp;<span style="color:#6b7280;font-size:12px">${listing.condition}</span><br/>
            <span style="font-size:12px;color:#374151">${listing.location}</span>
            ${distanceLine}
            <br/>
            <button
            data-listing-id="${listing.id}"
            style="
                margin-top:8px;
                width:100%;
                padding:6px 0;
                background:#3b82f6;
                color:#fff;
                border:none;
                border-radius:6px;
                font-size:13px;
                font-weight:600;
                cursor:pointer;
            "
            >View Details</button>
        </div>
        `);

      marker.on('popupopen', () => {
        const popupElement = marker.getPopup()?.getElement();
        const btn = popupElement?.querySelector(
          `[data-listing-id="${listing.id}"]`,
        ) as HTMLButtonElement | null;

        if (!btn) return;

        const handleClick = () => onSelectListing(listing);
        btn.addEventListener('click', handleClick, { once: true });

        marker.once('popupclose', () => {
          btn.removeEventListener('click', handleClick);
        });
      });
    }
  }, [filteredListings, userCoords, onSelectListing]);

  return (
    <div style={{ position: 'relative', height: '100%', minHeight: '500px' }}>
      {status && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%,-50%)',
            zIndex: 1000,
            background: 'rgba(15,23,42,0.85)',
            color: '#fff',
            padding: '0.75rem 1.5rem',
            borderRadius: '10px',
            fontSize: '14px',
            pointerEvents: 'none',
          }}
        >
          {status}
        </div>
      )}

      {/* Center-to-user button */}
      <button
        onClick={() => {
          const coords = userCoordsRef.current;
          if (coords && mapInstanceRef.current) {
            mapInstanceRef.current.setView([coords.lat, coords.lon], 15, {
              animate: true,
            });
          }
        }}
        title="Center map on my location"
        style={{
          position: 'absolute',
          bottom: '2rem',
          right: '1rem',
          zIndex: 1000,
          width: '42px',
          height: '42px',
          borderRadius: '50%',
          background: '#fff',
          border: '2px solid rgba(0,0,0,0.15)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
        }}
      >
        <img
          src={center}
          alt="Center on me"
          style={{ width: '22px', height: '22px', display: 'block' }}
        />
      </button>

      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '100%',
          minHeight: '500px',
          borderRadius: '12px',
        }}
      />
    </div>
  );
};

export default MapView;
