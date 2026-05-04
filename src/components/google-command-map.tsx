"use client";

import { useEffect, useRef, useCallback } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import type { ClaimType, MapSegment } from "@/lib/types";

const cityCoords: Record<string, { lat: number; lng: number }> = {
  "New York":      { lat: 40.7128,  lng: -74.006  },
  "San Francisco": { lat: 37.7749,  lng: -122.4194 },
  "Los Angeles":   { lat: 34.0522,  lng: -118.2437 },
  Chicago:         { lat: 41.8781,  lng: -87.6298  },
  Austin:          { lat: 30.2672,  lng: -97.7431  },
  Miami:           { lat: 25.7617,  lng: -80.1918  },
  Seattle:         { lat: 47.6062,  lng: -122.3321 },
  Denver:          { lat: 39.7392,  lng: -104.9903 },
};

const claimColors: Record<ClaimType, string> = {
  career:   "#58A6FF",
  business: "#3FB950",
  freelance:"#D29922",
  trading:  "#A371F7",
};

const darkStyles: google.maps.MapTypeStyle[] = [
  { elementType: "geometry",            stylers: [{ color: "#0a0c10" }] },
  { elementType: "labels.text.fill",    stylers: [{ color: "#8b949e" }] },
  { elementType: "labels.text.stroke",  stylers: [{ color: "#0a0c10" }] },
  { featureType: "administrative",      elementType: "geometry",           stylers: [{ color: "#30363d" }] },
  { featureType: "administrative",      elementType: "geometry.stroke",    stylers: [{ color: "#30363d" }] },
  { featureType: "administrative",      elementType: "labels.text.fill",   stylers: [{ color: "#8b949e" }] },
  { featureType: "administrative.locality", elementType: "labels",         stylers: [{ visibility: "off" }] },
  { featureType: "poi",                 stylers: [{ visibility: "off" }] },
  { featureType: "road",                stylers: [{ visibility: "off" }] },
  { featureType: "transit",             stylers: [{ visibility: "off" }] },
  { featureType: "water",               elementType: "geometry",           stylers: [{ color: "#05070a" }] },
  { featureType: "water",               elementType: "labels.text.fill",   stylers: [{ color: "#30363d" }] },
  { featureType: "landscape",           elementType: "geometry",           stylers: [{ color: "#0d1117" }] },
  { featureType: "landscape.natural",   elementType: "geometry",           stylers: [{ color: "#0d1117" }] },
];

function makeMarkerEl(segment: MapSegment, isSelected: boolean): HTMLElement {
  const color = claimColors[segment.claimType];
  const size = Math.min(64, Math.max(32, 24 + segment.count * 2));

  const outer = document.createElement("div");
  outer.style.cssText = `
    position: relative;
    width: ${size}px;
    height: ${size}px;
    cursor: pointer;
    transform: translate(-50%, -50%);
  `;

  // glow
  const glow = document.createElement("div");
  glow.style.cssText = `
    position: absolute;
    inset: -${size * 0.45}px;
    border-radius: 50%;
    background: ${color};
    opacity: 0.18;
    filter: blur(${size * 0.5}px);
    pointer-events: none;
  `;

  // circle
  const circle = document.createElement("div");
  circle.style.cssText = `
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 1.5px solid ${color};
    background: linear-gradient(180deg, ${color}30 0%, #0D1117 80%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-alliance), Arial, sans-serif;
    font-size: ${size < 40 ? 10 : 12}px;
    font-weight: 800;
    color: #F0F6FC;
    box-shadow: 0 0 ${size}px ${color}22;
    ${isSelected ? `outline: 2px solid rgba(240,246,252,0.6); outline-offset: 4px;` : ""}
    transition: outline 0.15s;
  `;
  circle.textContent = String(segment.count);

  outer.appendChild(glow);
  outer.appendChild(circle);
  return outer;
}

export function GoogleCommandMap({
  segments,
  selectedSegment,
  onSelectSegment,
}: {
  segments: MapSegment[];
  selectedSegment?: MapSegment;
  onSelectSegment: (segment: MapSegment) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);

  const clearMarkers = useCallback(() => {
    for (const m of markersRef.current) m.map = null;
    markersRef.current = [];
  }, []);

  const placeMarkers = useCallback(
    (map: google.maps.Map, AdvancedMarkerElement: typeof google.maps.marker.AdvancedMarkerElement) => {
      clearMarkers();
      for (const segment of segments) {
        const coords = cityCoords[segment.city];
        if (!coords) continue;

        const isSelected = selectedSegment?.key === segment.key;
        const el = makeMarkerEl(segment, isSelected);

        const marker = new AdvancedMarkerElement({
          map,
          position: coords,
          content: el,
          title: `${segment.category} · ${segment.city}`,
          zIndex: isSelected ? 10 : 1,
        });

        marker.addListener("click", () => onSelectSegment(segment));
        markersRef.current.push(marker);
      }
    },
    [segments, selectedSegment, onSelectSegment, clearMarkers],
  );

  useEffect(() => {
    if (!containerRef.current) return;

    setOptions({
      key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
      v: "weekly",
    });

    let cancelled = false;

    Promise.all([
      importLibrary("maps") as Promise<google.maps.MapsLibrary>,
      importLibrary("marker") as Promise<google.maps.MarkerLibrary>,
    ]).then(async ([mapsLib, markerLib]) => {
      if (cancelled || !containerRef.current) return;

      const { Map } = mapsLib;
      const { AdvancedMarkerElement } = markerLib;

      if (mapRef.current) {
        placeMarkers(mapRef.current, AdvancedMarkerElement);
        return;
      }

      const map = new Map(containerRef.current, {
        center: { lat: 39.5, lng: -98.35 },
        zoom: 4,
        mapId: process.env.NEXT_PUBLIC_GOOGLE_MAP_ID!,
        disableDefaultUI: true,
        zoomControl: true,
        zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_BOTTOM },
        backgroundColor: "#0a0c10",
        styles: darkStyles,
        gestureHandling: "cooperative",
      });

      mapRef.current = map;
      placeMarkers(map, AdvancedMarkerElement);
    });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-place markers when segments or selection changes (after map is ready)
  useEffect(() => {
    if (!mapRef.current) return;

    (importLibrary("marker") as Promise<google.maps.MarkerLibrary>).then((lib) => {
      placeMarkers(mapRef.current!, lib.AdvancedMarkerElement);
    });
  }, [segments, selectedSegment, placeMarkers]);

  return (
    <div ref={containerRef} className="h-full w-full" />
  );
}
