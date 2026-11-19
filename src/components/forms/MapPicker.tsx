'use client';

import React, { useState, useEffect } from 'react';

interface MapPickerProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  initialLat?: number;
  initialLng?: number;
  initialAddress?: string;
}

const INDIAN_CITIES = [
  { name: 'New Delhi', lat: 28.6139, lng: 77.209, addr: 'Central Secretariat, New Delhi' },
  { name: 'Mumbai', lat: 19.076, lng: 72.8777, addr: 'Bandra West, Mumbai, Maharashtra' },
  { name: 'Bengaluru', lat: 12.9716, lng: 77.5946, addr: 'MG Road, Bengaluru, Karnataka' },
  { name: 'Chennai', lat: 13.0827, lng: 80.2707, addr: 'Anna Salai, Chennai, Tamil Nadu' },
  { name: 'Hyderabad', lat: 17.385, lng: 78.4867, addr: 'Banjara Hills, Hyderabad, Telangana' },
  { name: 'Kolkata', lat: 22.5726, lng: 88.3639, addr: 'Park Street, Kolkata, West Bengal' },
];

export default function MapPicker({
  onLocationSelect,
  initialLat = 28.6139,
  initialLng = 77.209,
  initialAddress = '',
}: MapPickerProps) {
  const [lat, setLat] = useState<number>(initialLat);
  const [lng, setLng] = useState<number>(initialLng);
  const [address, setAddress] = useState<string>(initialAddress);
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync state with parent on change
  useEffect(() => {
    onLocationSelect(lat, lng, address);
  }, [lat, lng, address, onLocationSelect]);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser');
      return;
    }

    setIsDetecting(true);
    setErrorMsg(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const detectedLat = Number(pos.coords.latitude.toFixed(6));
        const detectedLng = Number(pos.coords.longitude.toFixed(6));
        setLat(detectedLat);
        setLng(detectedLng);

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${detectedLat}&lon=${detectedLng}&zoom=18&addressdetails=1`
          );
          const data = await res.json();
          const detectedAddr = data.display_name || `${detectedLat}, ${detectedLng}`;
          setAddress(detectedAddr);
        } catch {
          setAddress(`GPS: ${detectedLat}, ${detectedLng}`);
        }
        setIsDetecting(false);
      },
      (err) => {
        setIsDetecting(false);
        setErrorMsg('Could not detect location. Please select a city or enter address manually.');
      },
      { timeout: 10000 }
    );
  };

  const handleCitySelect = (city: typeof INDIAN_CITIES[0]) => {
    setLat(city.lat);
    setLng(city.lng);
    setAddress(city.addr);
  };

  return (
    <div className="space-y-4 bg-gray-50/70 p-4 rounded-xl border border-gray-200">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-sm font-semibold text-gray-800 flex items-center">
          <span className="mr-1.5">📍</span> Location Details
        </label>
        <button
          type="button"
          onClick={detectLocation}
          disabled={isDetecting}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 flex items-center transition-colors disabled:opacity-50"
        >
          {isDetecting ? 'Detecting...' : '🎯 Detect My Current Location'}
        </button>
      </div>

      {errorMsg && <p className="text-xs text-red-600">{errorMsg}</p>}

      {/* Quick City Presets */}
      <div>
        <p className="text-xs font-medium text-gray-500 mb-1.5">Quick City Selection:</p>
        <div className="flex flex-wrap gap-1.5">
          {INDIAN_CITIES.map((city) => (
            <button
              key={city.name}
              type="button"
              onClick={() => handleCitySelect(city)}
              className={`text-xs px-2.5 py-1 rounded-md transition-all ${
                lat === city.lat && lng === city.lng
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {city.name}
            </button>
          ))}
        </div>
      </div>

      {/* Address Input */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Street Address / Landmark
        </label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="e.g. Near Metro Pillar 142, Ring Road, Sector 4"
          className="w-full text-sm px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      {/* Coordinate Displays */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Latitude</label>
          <input
            type="number"
            step="any"
            value={lat}
            onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
            className="w-full text-xs font-mono px-3 py-2 bg-white border border-gray-300 rounded-lg outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Longitude</label>
          <input
            type="number"
            step="any"
            value={lng}
            onChange={(e) => setLng(parseFloat(e.target.value) || 0)}
            className="w-full text-xs font-mono px-3 py-2 bg-white border border-gray-300 rounded-lg outline-none"
          />
        </div>
      </div>

      {/* Visual Map Pin Preview */}
      <div className="rounded-lg overflow-hidden border border-gray-200 bg-white p-3 text-center text-xs text-gray-600 flex items-center justify-between">
        <span className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
          <span className="font-medium text-gray-700">Geo-tag Coordinates Locked:</span>
          <span className="font-mono text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
            {lat.toFixed(4)}°N, {lng.toFixed(4)}°E
          </span>
        </span>
        <span className="text-gray-400">Used for Duplicate Proximity Analysis</span>
      </div>
    </div>
  );
}
