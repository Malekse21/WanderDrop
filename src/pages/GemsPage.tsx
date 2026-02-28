import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { useGems } from '../hooks/useGems';
import type { Gem, GemType } from '../types';
import GemCard from '../components/GemCard';
import GemDetailSheet from '../components/GemDetailSheet';

const FILTER_OPTIONS: { label: string; value: GemType | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Food', value: 'food' },
  { label: 'Stay', value: 'stay' },
  { label: 'Nature', value: 'nature' },
  { label: 'Culture', value: 'culture' },
  { label: 'Night', value: 'night' },
  { label: 'Vibe', value: 'vibe' },
  { label: 'Secret', value: 'secret' },
];

// Helper to recolor leaflet pins based on gem type
const createCustomIcon = (gemType: GemType) => {
  // Map our tailwind bg classes to hex colors for the map marker
  const colorMap: Record<string, string> = {
    food: '#C4603A', // clay
    stay: '#5C7A4E', // moss
    nature: '#5C7A4E', // moss
    culture: '#E8C9A0', // sand
    night: '#1C1612', // ink
    vibe: '#D97B52', // terracotta
    secret: '#C4603A', // clay
  };
  
  const color = colorMap[gemType] || '#8B7355'; // dusk default

  return L.divIcon({
    className: 'custom-pin',
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid #FAF5EC; box-shadow: 0 4px 12px rgba(139, 115, 85, 0.4);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
}

export default function GemsPage() {
  const [mode, setMode] = useState<'feed' | 'map'>('feed');
  const [filter, setFilter] = useState<GemType | 'all'>('all');
  const [selectedGem, setSelectedGem] = useState<Gem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Tunisia coordinates as default fallback
  const [mapCenter, setMapCenter] = useState<[number, number]>([33.8869, 9.5375]); 

  const { gems, loading } = useGems(filter);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Rough mock geocoding based on common Tunisian cities for demonstration
    const q = searchQuery.toLowerCase();
    if (q.includes('tunis')) setMapCenter([36.8065, 10.1815]);
    else if (q.includes('sousse')) setMapCenter([35.8256, 10.6369]);
    else if (q.includes('tozeur')) setMapCenter([33.9197, 8.1336]);
    else if (q.includes('djerba')) setMapCenter([33.8076, 10.8451]);
    else if (q.includes('tataouine')) setMapCenter([32.9211, 10.4509]);
  };

  return (
    <div className="min-h-dvh bg-cream pb-24 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-cream/90 backdrop-blur-md border-b border-sand/30 shrink-0">
        <div className="max-w-md mx-auto px-4 py-3 pb-2">
          <div className="flex items-center justify-between mb-4">
            <h1 className="heading text-2xl text-ink">Gems</h1>
            
            {/* Mode Switcher */}
            <div className="flex bg-parchment p-1 rounded-full">
              <button
                onClick={() => setMode('feed')}
                className={`px-4 py-1.5 rounded-full text-sm font-instrument font-bold transition-all ${mode === 'feed' ? 'bg-cream text-ink shadow-warm-sm' : 'text-dusk'}`}
              >
                Feed
              </button>
              <button
                onClick={() => setMode('map')}
                className={`px-4 py-1.5 rounded-full text-sm font-instrument font-bold transition-all ${mode === 'map' ? 'bg-cream text-ink shadow-warm-sm' : 'text-dusk'}`}
              >
                Map
              </button>
            </div>
          </div>

          {/* Map Search Bar */}
          {mode === 'map' && (
            <motion.form 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              onSubmit={handleSearch}
              className="mb-4"
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search a city (e.g. Tunis, Tozeur)..."
                className="w-full px-4 py-2.5 bg-white border border-sand rounded-xl font-instrument text-ink text-sm shadow-warm-sm focus:outline-none focus:ring-2 focus:ring-clay/30"
              />
            </motion.form>
          )}

          {/* Filter Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
            {FILTER_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setFilter(opt.value)}
                className={`shrink-0 px-4 py-1.5 rounded-full font-instrument text-sm font-medium transition-all ${
                  filter === opt.value 
                    ? 'bg-clay text-cream shadow-warm-sm' 
                    : 'bg-parchment text-dusk hover:bg-sand/30'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className={`flex-1 ${mode === 'map' ? 'relative' : 'max-w-md mx-auto p-4 w-full'}`}>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 rounded-full border-4 border-sand border-t-clay animate-spin" />
          </div>
        ) : mode === 'feed' ? (
          <div className="space-y-4">
            {gems.length === 0 ? (
              <div className="text-center py-16">
                <span className="text-5xl">🏜️</span>
                <p className="font-instrument text-dusk mt-4">No gems found for this filter.</p>
              </div>
            ) : (
              // Masonry Rhythm: Every 3rd card is full width
              <div className="grid grid-cols-2 gap-4">
                {gems.map((gem, index) => {
                  const isFullWidth = (index + 1) % 3 === 0;
                  return (
                    <div key={gem.id} className={isFullWidth ? 'col-span-2' : 'col-span-1'}>
                      <GemCard 
                        gem={gem} 
                        fullWidth={isFullWidth} 
                        onClick={() => setSelectedGem(gem)} 
                      />
                    </div>
                  );
                })}
              </div>
            )}
            
            {gems.length > 0 && (
              <div className="h-12 flex items-center justify-center text-xs font-instrument text-dusk/50 tracking-widest uppercase">
                End of Feed
              </div>
            )}
          </div>
        ) : (
          /* Map Mode */
          <div className="absolute inset-0 z-10 bg-parchment">
            <MapContainer 
              center={mapCenter} 
              zoom={6} 
              scrollWheelZoom={true} 
              className="w-full h-full"
              zoomControl={false}
            >
              {/* Warm custom tile style using Voyager/CartoDB */}
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              />
              <MapUpdater center={mapCenter} />
              
              {gems.map(gem => gem.coordinates && (
                <Marker 
                  key={gem.id}
                  position={[gem.coordinates.lat, gem.coordinates.lng]}
                  icon={createCustomIcon(gem.gem_type)}
                  eventHandlers={{ click: () => setSelectedGem(gem) }}
                />
              ))}
            </MapContainer>
          </div>
        )}
      </main>

      {/* Details Sheet Overlay */}
      <GemDetailSheet 
        gem={selectedGem} 
        onClose={() => setSelectedGem(null)} 
      />
    </div>
  );
}
