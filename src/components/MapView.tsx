// PURPOSE: Map component for displaying employee locations with status indicators
// INPUT: latestLocations array with employee positions and compliance status
// BEHAVIOR: Shows one pin per employee; AUTO-FITS bounds to show all; click opens detail
// UX: Dark theme, accessible pins, status indicators, auto-zoom
// DO NOT: Show all raw historical locations; compute business logic

'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { cn, formatTime, formatDistance, getStatusLabel } from '@/lib/utils';
import { statusConfig } from '@/lib/tokens';
import { MapPin, Clock, User, X, Maximize2 } from 'lucide-react';
import type { MapViewProps, EmployeeLocation, ComplianceStatus } from '@/types';

// Dynamically import Leaflet components (SSR-safe)
import dynamic from 'next/dynamic';

const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

const MapBoundsController = dynamic<{
  locations: EmployeeLocation[];
  triggerFit: number;
}>(
  () => import('./MapBoundsController'),
  { ssr: false }
);

const DEFAULT_CENTER: [number, number] = [28.6139, 77.2090];
const DEFAULT_ZOOM = 5;

export function MapView({
  latestLocations,
  onPinClick,
  isLoading = false,
}: MapViewProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeLocation | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [shouldFitBounds, setShouldFitBounds] = useState(0);
  const locationsLengthRef = useRef(latestLocations.length);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && latestLocations.length > 0 && latestLocations.length !== locationsLengthRef.current) {
      locationsLengthRef.current = latestLocations.length;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShouldFitBounds(prev => prev + 1);
    }
  }, [latestLocations.length, isMounted]);

  const handleFitBounds = useCallback(() => {
    setShouldFitBounds(prev => prev + 1);
  }, []);

  if (isLoading || !isMounted) {
    return <MapViewSkeleton />;
  }

  const center = latestLocations.length > 0
    ? calculateCenter(latestLocations)
    : DEFAULT_CENTER;

  const statusCounts = latestLocations.reduce((acc, loc) => {
    acc[loc.status] = (acc[loc.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="overflow-hidden">
      {/* Header - Dark Theme */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-500/25">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Live Field Locations</h3>
            <p className="text-xs text-slate-400">
              {latestLocations.length} employee{latestLocations.length !== 1 ? 's' : ''} on field
            </p>
          </div>
        </div>
        <StatusLegend />
      </div>

      {/* Map */}
      <div className="relative h-80 rounded-xl overflow-hidden border border-white/10" role="application" aria-label="Employee location map">
        {latestLocations.length === 0 ? (
          <div className="h-full flex items-center justify-center bg-white/5">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
                <MapPin className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-lg font-bold text-white mb-1">No locations</p>
              <p className="text-sm text-slate-400">No employee location data available.</p>
            </div>
          </div>
        ) : (
          <>
            <MapContainer center={center} zoom={DEFAULT_ZOOM} className="h-full w-full z-0" scrollWheelZoom={true}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
              />
              <MapBoundsController locations={latestLocations} triggerFit={shouldFitBounds} />
              {latestLocations.map((location) => (
                <EmployeeMarker
                  key={location.employeeId}
                  location={location}
                  onClick={() => {
                    setSelectedEmployee(location);
                    onPinClick?.(location.employeeId);
                  }}
                />
              ))}
            </MapContainer>

            {/* Controls */}
            <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2">
              <button
                onClick={handleFitBounds}
                className="p-2.5 bg-[#1a2235]/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/10 hover:bg-white/10 transition-all group"
                title="Fit all employees"
              >
                <Maximize2 className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Status Summary */}
            <div className="absolute bottom-3 left-3 z-[1000]">
              <div className="px-4 py-2.5 bg-[#1a2235]/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/10">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-bold text-emerald-400">{statusCounts['compliant'] || 0}</span>
                    <span className="text-slate-400 text-xs">OK</span>
                  </div>
                  <div className="w-px h-4 bg-white/10" />
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="font-bold text-amber-400">{statusCounts['warning'] || 0}</span>
                    <span className="text-slate-400 text-xs">Warn</span>
                  </div>
                  <div className="w-px h-4 bg-white/10" />
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <span className="font-bold text-red-400">{statusCounts['breach'] || 0}</span>
                    <span className="text-slate-400 text-xs">Breach</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {selectedEmployee && (
          <EmployeeDetailCard
            location={selectedEmployee}
            onClose={() => setSelectedEmployee(null)}
            onViewDetails={() => {
              onPinClick?.(selectedEmployee.employeeId);
              setSelectedEmployee(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

// Employee Marker
interface EmployeeMarkerProps {
  location: EmployeeLocation;
  onClick: () => void;
}

function EmployeeMarker({ location, onClick }: EmployeeMarkerProps) {
  const status = statusConfig[location.status] || statusConfig.unknown;
  const [icon, setIcon] = useState<L.DivIcon | null>(null);

  useEffect(() => {
    import('leaflet').then((L) => {
      const divIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="cursor: pointer; position: relative;">
            <div style="width: 36px; height: 36px; border-radius: 50%; background: ${status.color}; border: 3px solid white; box-shadow: 0 4px 12px ${status.color}60; display: flex; align-items: center; justify-content: center;">
              <svg width="18" height="18" fill="none" stroke="white" stroke-width="2.5" viewBox="0 0 24 24">
                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </div>
            <div style="position: absolute; top: 100%; left: 50%; transform: translateX(-50%); margin-top: 4px; padding: 2px 8px; background: rgba(15,22,41,0.9); border-radius: 6px; white-space: nowrap; font-size: 11px; font-weight: 600; color: white; border: 1px solid rgba(255,255,255,0.1);">
              ${location.name.split(' ')[0]}
            </div>
          </div>
        `,
        iconSize: [36, 56],
        iconAnchor: [18, 36],
      });
      setIcon(divIcon);
    });
  }, [location, status]);

  if (!icon) return null;

  return (
    <Marker position={[location.lat, location.long]} icon={icon} eventHandlers={{ click: onClick }}>
      <Popup>
        <div className="p-3 min-w-[200px]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: status.bgColor }}>
              <User className="w-5 h-5" style={{ color: status.color }} />
            </div>
            <div>
              <p className="font-bold text-slate-900">{location.name}</p>
              <p className="text-xs text-slate-500">{location.employeeId}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-2 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: status.bgColor, color: status.color }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: status.color }} />
            {status.label}
          </div>
          {location.distance !== undefined && (
            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {formatDistance(location.distance)}
            </p>
          )}
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3" /> {formatTime(location.timestamp)}
          </p>
        </div>
      </Popup>
    </Marker>
  );
}

// Detail Card - Dark Theme
interface EmployeeDetailCardProps {
  location: EmployeeLocation;
  onClose: () => void;
  onViewDetails: () => void;
}

function EmployeeDetailCard({ location, onClose, onViewDetails }: EmployeeDetailCardProps) {
  const status = statusConfig[location.status];
  return (
    <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-72 bg-[#1a2235]/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 z-[1000]">
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: status.bgColor }}>
              <User className="w-5 h-5" style={{ color: status.color }} />
            </div>
            <div>
              <p className="font-bold text-white">{location.name}</p>
              <p className="text-xs text-slate-400">{location.employeeId}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>
        <div className="flex items-center gap-2 mb-3 px-2 py-1.5 rounded-lg text-xs font-semibold" style={{ backgroundColor: `${status.color}20`, color: status.color }}>
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: status.color }} />
          {status.label}
        </div>
        <div className="space-y-2 text-sm text-slate-300">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>Last seen: {formatTime(location.timestamp)}</span>
          </div>
          {location.distance !== undefined && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>Distance: {formatDistance(location.distance)}</span>
            </div>
          )}
        </div>
        <button onClick={onViewDetails} className="w-full mt-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-violet-500 to-purple-600 rounded-lg shadow-lg hover:shadow-xl transition-all">
          View Full Details
        </button>
      </div>
    </div>
  );
}

// Status Legend - Dark Theme
function StatusLegend() {
  return (
    <div className="hidden md:flex items-center gap-3 text-xs px-3 py-2 rounded-lg bg-white/5 border border-white/10">
      {(['compliant', 'warning', 'breach'] as const).map((status) => {
        const config = statusConfig[status];
        return (
          <div key={status} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: config.color }} />
            <span className="font-medium text-slate-300">{config.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// Skeleton - Dark Theme
function MapViewSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10" />
          <div className="space-y-2">
            <div className="h-5 w-40 rounded bg-white/10" />
            <div className="h-3 w-24 rounded bg-white/5" />
          </div>
        </div>
      </div>
      <div className="h-80 rounded-xl bg-white/5" />
    </div>
  );
}

function calculateCenter(locations: EmployeeLocation[]): [number, number] {
  if (locations.length === 0) return DEFAULT_CENTER;
  const sumLat = locations.reduce((sum, loc) => sum + loc.lat, 0);
  const sumLong = locations.reduce((sum, loc) => sum + loc.long, 0);
  return [sumLat / locations.length, sumLong / locations.length];
}

export default MapView;
