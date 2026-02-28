import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function BottomNav() {
  const location = useLocation();

  const links = [
    { to: '/', label: 'Home', icon: '🧭' },
    { to: '/gems', label: 'Gems', icon: '💎' },
    { to: '/challenges', label: 'Missions', icon: '🎯' },
    { to: '/post-gem', label: 'Post', icon: '➕' },
    { to: '/profile', label: 'Profile', icon: '🌎' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-cream/90 backdrop-blur-md border-t border-sand/30 pb-safe">
      <nav className="max-w-md mx-auto flex justify-between items-center px-6 py-2">
        {links.map((link) => {
          const isActive = location.pathname === link.to;

          return (
            <NavLink
              key={link.to}
              to={link.to}
              className="relative flex flex-col items-center justify-center w-16 h-12"
            >
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-indicator"
                  className="absolute inset-0 bg-parchment rounded-2xl -z-10"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className={`text-xl transition-transform ${isActive ? 'scale-110' : 'opacity-60 saturate-50'}`}>
                {link.icon}
              </span>
              <span className={`text-[10px] font-instrument font-bold mt-1 transition-colors ${isActive ? 'text-clay' : 'text-dusk/60'}`}>
                {link.label}
              </span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
