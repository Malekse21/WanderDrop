import { motion } from 'framer-motion';
import DropCard from '../components/DropCard';
import { useActiveDrop } from '../hooks/useActiveDrop';

export default function HomePage() {
  const { drop, loading, refetch } = useActiveDrop();

  return (
    <div className="min-h-dvh bg-cream pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-cream/80 backdrop-blur-md border-b border-sand/30">
        <div className="max-w-md mx-auto flex items-center justify-between px-4 py-3">
          <h1 className="heading text-xl text-ink">WanderDrop</h1>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-md mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <DropCard drop={drop} loading={loading} onReveal={refetch} />
        </motion.div>
      </main>
    </div>
  );
}
