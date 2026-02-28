import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { usePostGem } from '../hooks/usePostGem';
import type { GemType } from '../types';

const GEM_TYPES: { value: GemType; label: string; icon: string }[] = [
  { value: 'food', label: 'Food & Drink', icon: '🍽️' },
  { value: 'culture', label: 'Culture & Art', icon: '🏛️' },
  { value: 'nature', label: 'Nature', icon: '🌿' },
  { value: 'night', label: 'Nightlife', icon: '🌙' },
  { value: 'stay', label: 'Unique Stay', icon: '🛏️' },
  { value: 'vibe', label: 'Just a Vibe', icon: '✨' },
  { value: 'secret', label: 'Absolute Secret', icon: '🔒' },
];

const pinIcon = L.divIcon({
  className: 'custom-pin',
  html: `<div style="background-color: #C4603A; width: 20px; height: 20px; border-radius: 50%; border: 3px solid #FAF5EC; box-shadow: 0 4px 12px rgba(139, 115, 85, 0.4);"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// Component to handle map clicks for pin placement
function LocationMarker({ position, setPosition }: { position: L.LatLng | null, setPosition: (pos: L.LatLng) => void }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={pinIcon} />
  );
}

export default function PostGemPage() {
  const navigate = useNavigate();
  const { form, updateField, submit, loading, error } = usePostGem();
  const [pinPos, setPinPos] = useState<L.LatLng | null>(null);

  useEffect(() => {
    if (pinPos) {
      updateField('coordinates', { lat: pinPos.lat, lng: pinPos.lng });
    }
  }, [pinPos]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await submit();
    if (success) {
      navigate('/gems');
    }
  };

  return (
    <div className="min-h-dvh bg-cream pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-cream/90 backdrop-blur-md border-b border-sand/30 shrink-0">
        <div className="max-w-md mx-auto px-4 py-3 pb-2 flex items-center justify-between">
          <h1 className="heading text-2xl text-ink">Post a Gem</h1>
          <button 
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-1.5 bg-ink text-cream rounded-full font-instrument font-bold text-sm disabled:opacity-50"
          >
            {loading ? 'Posting...' : 'Post'}
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto p-0">
        <form onSubmit={handleSubmit} className="divide-y divide-sand/30">
          
          {error && (
            <div className="bg-red-50 text-red-600 p-4 font-instrument text-sm">
              {error}
            </div>
          )}

          {/* Photos Section */}
          <section className="p-6">
            <h2 className="font-instrument font-bold text-dusk uppercase tracking-wider text-xs mb-4">Photos</h2>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              <label className="shrink-0 w-32 h-40 rounded-2xl border-2 border-dashed border-sand/50 flex flex-col items-center justify-center text-dusk/50 hover:bg-sand/10 hover:border-clay/30 transition-colors cursor-pointer">
                <span className="text-3xl mb-2">+</span>
                <span className="font-instrument text-[10px] uppercase font-bold tracking-widest">Upload</span>
                {/* Mock file input */}
                <input type="file" className="hidden" accept="image/*" multiple onChange={() => {
                  // In a real app we'd capture files, for the mock we pretend
                  alert("Photo upload simulated.");
                }} />
              </label>
              <div className="shrink-0 w-32 h-40 rounded-2xl bg-parchment flex items-center justify-center text-dusk/30 font-instrument text-xs italic">
                No photo selected
              </div>
            </div>
            <p className="mt-2 text-[10px] font-instrument text-dusk/60">Upload up to 5 photos. Real places, no filters.</p>
          </section>

          {/* Basics Section */}
          <section className="p-6 space-y-5">
            <h2 className="font-instrument font-bold text-dusk uppercase tracking-wider text-xs mb-4">The Details</h2>
            
            <div>
              <input
                type="text"
                placeholder="Give it a catchy name"
                className="w-full text-2xl heading text-ink bg-transparent focus:outline-none placeholder:text-sand placeholder:font-instrument placeholder:not-italic"
                value={form.title}
                onChange={(e) => updateField('title', e.target.value)}
                required
              />
            </div>

            <div>
              <textarea
                placeholder="Describe the experience. What makes it special? Tell us what you felt here..."
                className="w-full text-ink bg-transparent resize-none h-32 font-instrument text-lg focus:outline-none placeholder:text-dusk/40"
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-dusk font-bold mb-2">Gem Type</label>
                <select
                  className="w-full bg-parchment border border-sand rounded-xl p-3 font-instrument text-ink text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-clay/30"
                  value={form.gem_type || ''}
                  onChange={(e) => updateField('gem_type', e.target.value as GemType)}
                  required
                >
                  <option value="" disabled>Select Type...</option>
                  {GEM_TYPES.map(g => <option key={g.value} value={g.value}>{g.icon} {g.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-dusk font-bold mb-2">City/Region</label>
                <input
                  type="text"
                  placeholder="e.g. Tunis"
                  className="w-full bg-parchment border border-sand rounded-xl p-3 font-instrument text-ink text-sm focus:outline-none focus:ring-2 focus:ring-clay/30"
                  value={form.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  required
                />
              </div>
            </div>
          </section>

          {/* Location Section */}
          <section className="p-6 space-y-4">
            <h2 className="font-instrument font-bold text-dusk uppercase tracking-wider text-xs mb-2">Exact Location</h2>
            <p className="text-[10px] font-instrument text-dusk/60 pb-2">Tap the map to drop a pin. Locals rely on exact coordinates.</p>
            
            <div className="w-full h-48 rounded-2xl overflow-hidden border border-sand shadow-warm-sm z-10 relative">
              <MapContainer 
                center={[33.8869, 9.5375]} 
                zoom={5} 
                className="w-full h-full"
                zoomControl={false}
              >
                <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                <LocationMarker position={pinPos} setPosition={setPinPos} />
              </MapContainer>
            </div>

            <div>
               <input
                  type="text"
                  placeholder="Address or directions (e.g. 'Behind the blue door')"
                  className="w-full bg-parchment border border-sand rounded-xl p-3 font-instrument text-ink text-sm focus:outline-none focus:ring-2 focus:ring-clay/30"
                  value={form.address_hint}
                  onChange={(e) => updateField('address_hint', e.target.value)}
                />
            </div>
            {/* hidden country field to ensure it passes validation since we ask for city */}
            <input type="hidden" value={form.country = "Tunisia"} />
          </section>

          {/* Time & Tips Section */}
          <section className="p-6 space-y-5">
            <h2 className="font-instrument font-bold text-dusk uppercase tracking-wider text-xs mb-4">Insider Tips</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-dusk font-bold mb-2">Best Time to Go</label>
                <input
                  type="text"
                  placeholder="e.g. Sunrise"
                  className="w-full bg-parchment border border-sand rounded-xl p-3 font-instrument text-ink text-sm focus:outline-none focus:ring-2 focus:ring-clay/30"
                  value={form.best_time}
                  onChange={(e) => updateField('best_time', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-dusk font-bold mb-2">When to Avoid</label>
                <input
                  type="text"
                  placeholder="e.g. Weekends"
                  className="w-full bg-parchment border border-sand rounded-xl p-3 font-instrument text-ink text-sm focus:outline-none focus:ring-2 focus:ring-clay/30"
                  value={form.avoid_time}
                  onChange={(e) => updateField('avoid_time', e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-terracotta/10 rounded-xl border border-terracotta/20 mt-4">
              <div>
                <h3 className="font-instrument font-bold text-ink text-sm pb-1">Open for Hosting?</h3>
                <p className="font-instrument text-dusk text-[10px] w-4/5">Are you willing to meet travelers here or show them around?</p>
              </div>
              <button
                type="button"
                onClick={() => updateField('open_for_hosting', !form.open_for_hosting)}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${form.open_for_hosting ? 'bg-clay' : 'bg-sand'} relative`}
              >
                <div className={`w-4 h-4 bg-cream rounded-full transition-transform ${form.open_for_hosting ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
          </section>

        </form>
      </main>
    </div>
  );
}
