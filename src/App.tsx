import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { isMock } from './api';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { LoginModal } from './components/LoginModal';
import { SpaceBackground } from './components/SpaceBackground';
import { Home } from './pages/Home';
import { Legal, NotFound } from './pages/Legal';
import { Payment } from './pages/Payment';
import { Purchases } from './pages/Purchases';
import { Shop } from './pages/Shop';

// Страница игры тянет плеер hls.js — грузим её отдельным чанком
const Game = lazy(() => import('./pages/Game').then((m) => ({ default: m.Game })));

function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => { scrollTo(0, 0); }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <SpaceBackground />
      <ScrollTop />
      <div className="app">
        <Header />
        <main className="main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/game/:id" element={<Suspense fallback={<div className="ghero" />}><Game /></Suspense>} />
            <Route path="/purchases" element={<Purchases />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/payment/success" element={<Payment />} />
            <Route path="/payment/fail" element={<Payment failed />} />
            <Route path="/offer" element={<Legal kind="offer" />} />
            <Route path="/privacy" element={<Legal kind="privacy" />} />
            <Route path="/consent" element={<Legal kind="consent" />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
      <LoginModal />
      {isMock && <div className="mock-pill" title="Данные из src/api/mock.ts">MOCK API</div>}
    </>
  );
}
