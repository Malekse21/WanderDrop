import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getRandomTunisianTrip } from '../lib/mockData';
import LoadingOverlay from '../components/LoadingOverlay';
import type { DropFormData, Climate, TravelStyle, Currency } from '../types';

const climateOptions: Climate[] = ['Mediterranean', 'Desert (Sahara)', 'Steppe-Arid', 'Highlands'];
const styleOptions: TravelStyle[] = ['Roman Heritage', 'Souks & Medinas', 'Sahara Expeditions', 'Island Life', 'Culinary Discovery', 'Modern Vibe'];
const currencyOptions: Currency[] = ['USD', 'EUR', 'TND'];

export default function NewDropPage() {
  const navigate = useNavigate();
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState<DropFormData>({
    departure_city: 'Tunis',
    departure_date: '',
    duration_days: 5,
    budget_min: 500,
    budget_max: 1500,
    currency: 'USD',
    climate_preferences: [],
    travel_style: [],
    excluded_countries: '',
  });

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const toggleClimate = (c: Climate) => {
    setForm((prev) => ({
      ...prev,
      climate_preferences: prev.climate_preferences.includes(c)
        ? prev.climate_preferences.filter((x) => x !== c)
        : [...prev.climate_preferences, c],
    }));
  };

  const toggleStyle = (s: TravelStyle) => {
    setForm((prev) => ({
      ...prev,
      travel_style: prev.travel_style.includes(s)
        ? prev.travel_style.filter((x) => x !== s)
        : [...prev.travel_style, s],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setGenerating(true);

    try {
      // Simulate network delay for AI generation (4 seconds)
      await new Promise((resolve) => setTimeout(resolve, 4000));

      const randomTrip = getRandomTunisianTrip();

      // Create a local active drop using mock data
      const localDrop = {
        ...randomTrip,
        // Override with user's actual form inputs
        budget_min: form.budget_min,
        budget_max: form.budget_max,
        currency: form.currency,
        duration_days: form.duration_days,
        departure_date: form.departure_date,
        departure_city: form.departure_city,
        climate_preferences: form.climate_preferences,
        travel_style: form.travel_style,
        excluded_countries: form.excluded_countries
          ? form.excluded_countries.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        // Set reveal time to 5 seconds from now for easy testing
        reveal_at: new Date(Date.now() + 5000).toISOString(),
        status: 'active' as const,
      };

      // Save to localStorage so HomePage can pick it up
      localStorage.setItem('wanderdrop_active_drop', JSON.stringify(localDrop));

      navigate('/');
    } catch (err: unknown) {
      console.error('Drop generation failed:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setGenerating(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {generating && <LoadingOverlay />}
      </AnimatePresence>

      <div className="min-h-dvh bg-cream">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-cream/80 backdrop-blur-md border-b border-sand/30">
          <div className="max-w-md mx-auto flex items-center justify-between px-4 py-3">
            <button
              onClick={() => navigate('/')}
              className="font-instrument text-sm text-clay font-medium"
            >
              ← Back
            </button>
            <h1 className="heading text-lg text-ink">New Drop</h1>
            <div className="w-12" />
          </div>
        </header>

        <form onSubmit={handleSubmit} className="max-w-md mx-auto px-4 py-6 pb-28">
          {/* Section 1: Departure */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0, type: 'spring', stiffness: 300, damping: 25 }}
            className="bg-parchment rounded-3xl p-5 shadow-warm mb-5"
          >
            <h2 className="heading text-xl text-ink mb-4">Where & When</h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="departure-city" className="block font-instrument text-xs font-semibold text-dusk uppercase tracking-wider mb-1.5">
                  Departure City
                </label>
                <input
                  id="departure-city"
                  type="text"
                  required
                  value={form.departure_city}
                  onChange={(e) => setForm({ ...form, departure_city: e.target.value })}
                  className="w-full px-4 py-3 bg-cream border border-sand rounded-xl font-instrument text-ink placeholder:text-dusk/40 focus:outline-none focus:ring-2 focus:ring-clay/30 transition"
                  placeholder="e.g. Tunis, Sousse, Djerba"
                />
              </div>

              <div>
                <label htmlFor="departure-date" className="block font-instrument text-xs font-semibold text-dusk uppercase tracking-wider mb-1.5">
                  Departure Date
                </label>
                <input
                  id="departure-date"
                  type="date"
                  required
                  min={minDate}
                  value={form.departure_date}
                  onChange={(e) => setForm({ ...form, departure_date: e.target.value })}
                  className="w-full px-4 py-3 bg-cream border border-sand rounded-xl font-instrument text-ink focus:outline-none focus:ring-2 focus:ring-clay/30 transition"
                />
              </div>

              <div>
                <label className="block font-instrument text-xs font-semibold text-dusk uppercase tracking-wider mb-1.5">
                  Duration (Days)
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setForm({ ...form, duration_days: Math.max(3, form.duration_days - 1) })
                    }
                    className="w-11 h-11 bg-cream border border-sand rounded-xl font-instrument text-ink text-lg hover:border-clay transition flex items-center justify-center"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    id="duration-days"
                    min={3}
                    max={21}
                    value={form.duration_days}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        duration_days: Math.min(21, Math.max(3, parseInt(e.target.value) || 3)),
                      })
                    }
                    className="flex-1 text-center px-4 py-2.5 bg-cream border border-sand rounded-xl font-instrument text-ink text-lg focus:outline-none focus:ring-2 focus:ring-clay/30 transition"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setForm({ ...form, duration_days: Math.min(21, form.duration_days + 1) })
                    }
                    className="w-11 h-11 bg-cream border border-sand rounded-xl font-instrument text-ink text-lg hover:border-clay transition flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Section 2: Budget */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 25 }}
            className="bg-parchment rounded-3xl p-5 shadow-warm mb-5"
          >
            <h2 className="heading text-xl text-ink mb-4">Budget</h2>

            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label htmlFor="budget-min" className="block font-instrument text-xs font-semibold text-dusk uppercase tracking-wider mb-1.5">
                    Minimum
                  </label>
                  <input
                    id="budget-min"
                    type="number"
                    required
                    min={0}
                    value={form.budget_min}
                    onChange={(e) => setForm({ ...form, budget_min: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-cream border border-sand rounded-xl font-instrument text-ink placeholder:text-dusk/40 focus:outline-none focus:ring-2 focus:ring-clay/30 transition"
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="budget-max" className="block font-instrument text-xs font-semibold text-dusk uppercase tracking-wider mb-1.5">
                    Maximum
                  </label>
                  <input
                    id="budget-max"
                    type="number"
                    required
                    min={0}
                    value={form.budget_max}
                    onChange={(e) => setForm({ ...form, budget_max: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-cream border border-sand rounded-xl font-instrument text-ink placeholder:text-dusk/40 focus:outline-none focus:ring-2 focus:ring-clay/30 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block font-instrument text-xs font-semibold text-dusk uppercase tracking-wider mb-1.5">
                  Currency
                </label>
                <div className="flex gap-2">
                  {currencyOptions.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setForm({ ...form, currency: c })}
                      className={`flex-1 py-2.5 rounded-xl font-instrument font-medium text-sm transition-all ${
                        form.currency === c
                          ? 'bg-clay text-cream shadow-warm-sm'
                          : 'bg-cream border border-sand text-dusk hover:border-clay'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.section>

          {/* Section 3: Preferences */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 25 }}
            className="bg-parchment rounded-3xl p-5 shadow-warm mb-5"
          >
            <h2 className="heading text-xl text-ink mb-4">Preferences</h2>

            <div className="space-y-5">
              {/* Climate */}
              <div>
                <label className="block font-instrument text-xs font-semibold text-dusk uppercase tracking-wider mb-2">
                  Climate
                </label>
                <div className="flex flex-wrap gap-2">
                  {climateOptions.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleClimate(c)}
                      className={`px-4 py-2 rounded-full font-instrument text-sm transition-all ${
                        form.climate_preferences.includes(c)
                          ? 'bg-clay text-cream shadow-warm-sm'
                          : 'bg-cream border border-sand text-dusk hover:border-clay'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Travel Style */}
              <div>
                <label className="block font-instrument text-xs font-semibold text-dusk uppercase tracking-wider mb-2">
                  Travel Style
                </label>
                <div className="flex flex-wrap gap-2">
                  {styleOptions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleStyle(s)}
                      className={`px-4 py-2 rounded-full font-instrument text-sm transition-all ${
                        form.travel_style.includes(s)
                          ? 'bg-clay text-cream shadow-warm-sm'
                          : 'bg-cream border border-sand text-dusk hover:border-clay'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Excluded countries */}
              <div>
                <label htmlFor="excluded-countries" className="block font-instrument text-xs font-semibold text-dusk uppercase tracking-wider mb-1.5">
                  Countries to Avoid{' '}
                  <span className="text-dusk/50 normal-case tracking-normal">(optional, comma-separated)</span>
                </label>
                <input
                  id="excluded-countries"
                  type="text"
                  value={form.excluded_countries}
                  onChange={(e) => setForm({ ...form, excluded_countries: e.target.value })}
                  className="w-full px-4 py-3 bg-cream border border-sand rounded-xl font-instrument text-ink placeholder:text-dusk/40 focus:outline-none focus:ring-2 focus:ring-clay/30 transition"
                  placeholder="e.g. France, Italy"
                />
              </div>
            </div>
          </motion.section>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-600 text-sm font-instrument bg-red-50 px-4 py-3 rounded-xl mb-4"
            >
              {error}
            </motion.p>
          )}
        </form>

        {/* Sticky submit button */}
        <div className="fixed bottom-0 left-0 right-0 z-20 bg-cream/90 backdrop-blur-md border-t border-sand/30 p-4">
          <div className="max-w-md mx-auto">
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={generating}
              className="w-full py-4 bg-clay text-cream font-instrument font-semibold text-lg rounded-2xl shadow-warm hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              🎲 Let the AI Decide
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
