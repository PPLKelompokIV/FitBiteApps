import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Masuk } from './Login';
import Daftar from './Register';
import DashboardHariIni from './Dashboard hari ini';
import AktivitasHidrasi from './Aktivitas & hidrasi';
import BodyCheckPagi from './Body Check Pagi/bodycheckpagi';
import FotoAiTinjauHasil from './FotoAi';
import AdminPantauAkun from './Admin/AdminPantau';
import AdminPengelolaan from './Admin/AdminPengelolaan';
import ActivitiesPage from './Admin/ActivitiesPage';
import ProfilPengingat from './Profil & Pengingat/Profil&Pengingat';
import JurnalMakanan from './JurnalMakanan';
import JurnalEvaluasi from './Jurnal & evaluasi/JurnalEvaluasiPage';
import ProgresPage from './Progress';
import HealthProfileSetup from './Profil pengaturan awal/HealthProfileSetup';
import { isAuthenticated, isAdmin } from './utils/auth';

const ACCESS_DENIED_KEY = 'fitbite_access_denied_msg';

/**
 * 4A Keamanan Sistem Informasi - Role-Based Authorization Guard
 * - Authentication: Memastikan token sesi login aktif tersedia di LocalStorage.
 * - Authorization: Memvalidasi izin peran (Role 'admin' vs 'user').
 */
function ProtectedRoute({ children, requiredRole }) {
  const isAuth = isAuthenticated();
  const userIsAdmin = isAdmin();

  // Jika belum login, alihkan ke halaman masuk
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  // Jika rute butuh hak akses admin namun pengguna bukan admin, alihkan ke dashboard user + notifikasi error
  if (requiredRole === 'admin' && !userIsAdmin) {
    sessionStorage.setItem(
      ACCESS_DENIED_KEY,
      'Akses ditolak: Halaman khusus Administrator'
    );
    return <Navigate to="/bodycheckpagi" replace />;
  }

  return children;
}

function AccessDeniedToast() {
  const location = useLocation();
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(ACCESS_DENIED_KEY);
    if (stored) {
      setMessage(stored);
      sessionStorage.removeItem(ACCESS_DENIED_KEY);
      const timer = window.setTimeout(() => setMessage(null), 5000);
      return () => window.clearTimeout(timer);
    }
  }, [location.pathname]);

  if (!message) return null;

  return (
    <div
      role="alert"
      className="fixed top-5 right-5 z-[70] flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700 shadow-md"
    >
      <span>{message}</span>
      <button
        type="button"
        onClick={() => setMessage(null)}
        aria-label="Tutup peringatan akses ditolak"
        className="text-red-500 hover:text-red-800"
      >
        ✕
      </button>
    </div>
  );
}

function App() {
  return (
    <>
      <AccessDeniedToast />
      <Routes>
        {/* Rute Publik: Autentikasi & Registrasi */}
        <Route path="/" element={<Masuk />} />
        <Route path="/login" element={<Masuk />} />
        <Route path="/register" element={<Daftar />} />

        {/* Rute Terproteksi: Pengguna Umum FitBite */}
        <Route
          path="/dashboard-hari-ini"
          element={
            <ProtectedRoute>
              <DashboardHariIni />
            </ProtectedRoute>
          }
        />
        <Route
          path="/aktivitas-hidrasi"
          element={
            <ProtectedRoute>
              <AktivitasHidrasi />
            </ProtectedRoute>
          }
        />
        <Route
          path="/body-check-pagi"
          element={<Navigate to="/bodycheckpagi" replace />}
        />
        <Route
          path="/bodycheckpagi"
          element={
            <ProtectedRoute>
              <BodyCheckPagi />
            </ProtectedRoute>
          }
        />
        <Route
          path="/foto-ai"
          element={
            <ProtectedRoute>
              <FotoAiTinjauHasil />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jurnal-makanan"
          element={
            <ProtectedRoute>
              <JurnalMakanan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jurnal-evaluasi"
          element={
            <ProtectedRoute>
              <JurnalEvaluasi />
            </ProtectedRoute>
          }
        />
        <Route
          path="/progres"
          element={
            <ProtectedRoute>
              <ProgresPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profil-kesehatan"
          element={
            <ProtectedRoute>
              <HealthProfileSetup />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profil-pengingat"
          element={
            <ProtectedRoute>
              <ProfilPengingat />
            </ProtectedRoute>
          }
        />

        {/* Rute Terproteksi Khusus Administrator (Role: 'admin') */}
        <Route
          path="/admin/pantau"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminPantauAkun />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute requiredRole="admin">
              <Navigate to="/admin/pantau" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/pengelolaan"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminPengelolaan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/aktivitas"
          element={
            <ProtectedRoute requiredRole="admin">
              <ActivitiesPage />
            </ProtectedRoute>
          }
        />

        {/* Fallback ke halaman login jika rute tidak ditemukan */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

export default App;