import { Routes, Route, Navigate } from 'react-router-dom';
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
import HealthProfileSetup from './Profil pengaturan awal/HealthProfileSetup';
import { isAuthenticated, isAdmin } from './utils/auth';

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

  // Jika rute butuh hak akses admin namun pengguna bukan admin, alihkan ke dashboard user
  if (requiredRole === 'admin' && !userIsAdmin) {
    return <Navigate to="/bodycheckpagi" replace />;
  }

  return children;
}

function App() {
  return (
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
  );
}

export default App;