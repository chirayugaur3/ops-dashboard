// PURPOSE: Controller component that auto-fits map bounds to show all markers
// This component uses the useMap hook from react-leaflet and must be a child of MapContainer

'use client';

import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import type { EmployeeLocation } from '@/types';

export interface MapBoundsControllerProps {
  locations: EmployeeLocation[];
  triggerFit: number;
}

export default function MapBoundsController({ locations, triggerFit }: MapBoundsControllerProps) {
  const map = useMap();
  const initialFitDone = useRef(false);

  // Fit bounds when locations change or when triggerFit changes
  useEffect(() => {
    if (locations.length === 0) return;

    // Create bounds from all locations
    const bounds = L.latLngBounds(
      locations.map(loc => [loc.lat, loc.long] as [number, number])
    );

    // Fit the map to show all markers with padding
    map.fitBounds(bounds, {
      padding: [60, 60],
      maxZoom: 14,
      animate: initialFitDone.current, // Only animate after initial fit
    });

    initialFitDone.current = true;
  }, [map, locations, triggerFit]);

  return null;
}
