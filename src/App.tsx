import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import HomePage from './pages/HomePage';
import NewDropPage from './pages/NewDropPage';
import GemsPage from './pages/GemsPage';
import PostGemPage from './pages/PostGemPage';
import ChallengesPage from './pages/ChallengesPage';
import ProfilePage from './pages/ProfilePage';
import PublicProfilePage from './pages/PublicProfilePage';
import BottomNav from './components/BottomNav';

function Layout() {
  return (
    <div className="relative min-h-dvh">
      <Outlet />
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main Tab Layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/gems" element={<GemsPage />} />
          <Route path="/post-gem" element={<PostGemPage />} />
          <Route path="/challenges" element={<ChallengesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* Fullscreen Pages (No Nav) */}
        <Route path="/new" element={<NewDropPage />} />
        <Route path="/profile/:shareToken" element={<PublicProfilePage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
