import { Routes, Route } from 'react-router-dom';
import { Masuk } from './Login';
import Daftar from './Register';
import AdminPantauAkun from './Admin/AdminPantau';
import AdminPengelolaan from './Admin/AdminPengelolaan';
import ActivitiesPage from './Admin/ActivitiesPage';
import ProfilPengingat from './Profil & Pengingat/Profil&Pengingat';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Masuk />} />
      <Route path="/login" element={<Masuk />} />
      <Route path="/register" element={<Daftar />} />
      <Route path="/admin/pantau" element={<AdminPantauAkun />} />
      <Route path="/admin/pengelolaan" element={<AdminPengelolaan />} />
      <Route path="/admin/aktivitas" element={<ActivitiesPage />} />
      <Route path="/profil-pengingat" element={<ProfilPengingat />} />
    </Routes>
  );
}

export default App;