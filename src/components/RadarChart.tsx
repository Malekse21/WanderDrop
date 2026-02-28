import { motion } from 'framer-motion';
import type { WandererProfile } from '../types';

interface RadarChartProps {
  profile: WandererProfile;
  size?: number;
}

// Axis definitions
const AXES = [
  { labelTop: 'Spontaneous', labelBottom: 'Planner', key: 'chaos_score', color: '#C4603A' }, // clay
  { labelTop: 'Social', labelBottom: 'Solo', key: 'connection_score', color: '#5C7A4E' }, // moss
  { labelTop: 'Culture', labelBottom: 'Nature', key: 'culture_score', color: '#E8C9A0' }, // sand
  { labelTop: 'Adrenaline', labelBottom: 'Comfort', key: 'sensation_score', color: '#D97B52' }, // terracotta
  { labelTop: 'Foodie', labelBottom: 'Fuel', key: 'foodie_depth_score', color: '#8B7355' }, // dusk
  { labelTop: 'Night Owl', labelBottom: 'Early Bird', key: 'night_owl_score', color: '#1C1612' }, // ink
];

export default function RadarChart({ profile, size = 300 }: RadarChartProps) {
  const center = size / 2;
  const radius = (size / 2) * 0.7; // Leave room for labels

  // Helper to calculate terminal points of axes
  const getPoint = (score: number, angleIndex: number, totalAxes: number, r: number) => {
    // Math.PI / 2 offset to point the first axis straight up
    const angle = (Math.PI * 2 * angleIndex) / totalAxes - Math.PI / 2;
    // Score is 0-100, map to radius 0-r
    const length = (score / 100) * r;
    return {
      x: center + Math.cos(angle) * length,
      y: center + Math.sin(angle) * length,
    };
  };

  // Generate grid levels (20%, 40%, 60%, 80%, 100%)
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1];
  
  // Calculate the path for the actual user profile polygon
  const profilePoints = AXES.map((axis, i) => {
    // Use the score or fallback to 0
    const score = profile[axis.key as keyof WandererProfile] as number || 0;
    return getPoint(score, i, AXES.length, radius);
  });
  
  const polygonPath = profilePoints.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div className="relative w-full flex justify-center items-center py-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        
        {/* Draw background hexagonal grids */}
        {gridLevels.map((level, levelIdx) => {
          const points = AXES.map((_, i) => getPoint(100 * level, i, AXES.length, radius));
          const path = points.map(p => `${p.x},${p.y}`).join(' ');
          return (
            <polygon
              key={`grid-${levelIdx}`}
              points={path}
              fill="none"
              stroke="#E8C9A0" // sand
              strokeWidth="1"
              opacity="0.3"
            />
          );
        })}

        {/* Draw axes connecting the center to the outer edges */}
        {AXES.map((_, i) => {
          const outerPoint = getPoint(100, i, AXES.length, radius);
          return (
            <line
              key={`axis-${i}`}
              x1={center}
              y1={center}
              x2={outerPoint.x}
              y2={outerPoint.y}
              stroke="#E8C9A0"
              strokeWidth="1"
              opacity="0.5"
            />
          );
        })}

        {/* Draw the Profile Shape Polygon with an expanding spring animation */}
        <motion.polygon
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.2 }}
          style={{ transformOrigin: 'center' }}
          className="origin-center"
          points={polygonPath}
          fill="rgba(217, 123, 82, 0.4)" // terracotta semi-transparent
          stroke="#D97B52"
          strokeWidth="3"
          strokeLinejoin="round"
        />

        {/* Draw data dots at the axis intersections */}
        {profilePoints.map((point, i) => (
          <motion.circle
            key={`dot-${i}`}
            initial={{ r: 0 }}
            animate={{ r: 4 }}
            transition={{ delay: 0.6 + (i * 0.1) }}
            cx={point.x}
            cy={point.y}
            fill="#FAF5EC" // cream
            stroke={AXES[i].color}
            strokeWidth="2"
          />
        ))}

        {/* Draw Text Labels just outside the absolute radius */}
        {AXES.map((axis, i) => {
          const outerPoint = getPoint(115, i, AXES.length, radius); // Push text out
          
          // Determine text anchor based on X position to prevent clipping
          let anchor: "start" | "middle" | "end" = "middle";
          if (outerPoint.x < center - 10) anchor = "end";
          if (outerPoint.x > center + 10) anchor = "start";

          return (
            <g key={`label-${i}`}>
              <text
                x={outerPoint.x}
                y={outerPoint.y - 4}
                textAnchor={anchor}
                className="font-instrument text-[10px] font-bold fill-ink"
              >
                {axis.labelTop}
              </text>
              <text
                x={outerPoint.x}
                y={outerPoint.y + 8}
                textAnchor={anchor}
                className="font-instrument text-[8px] fill-dusk/70"
              >
                {axis.labelBottom}
              </text>
            </g>
          );
        })}

      </svg>
    </div>
  );
}
