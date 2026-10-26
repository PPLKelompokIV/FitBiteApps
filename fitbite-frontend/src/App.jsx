import { Routes, Route } from 'react-router-dom';
import { Masuk } from './Login';
import Daftar from './Register';
import BodyCheckPagi from './bodycheckpagi';
import FotoAiTinjauHasil from './FotoAi';
import AdminPantauAkun from './Admin/AdminPantau';
import ProfilPengingat from './Profil & Pengingat/Profil&Pengingat';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Masuk />} />
      <Route path="/login" element={<Masuk />} />
      <Route path="/register" element={<Daftar />} />
      <Route path="/bodycheckpagi" element={<BodyCheckPagi />} />
      <Route path="/foto-ai" element={<FotoAiTinjauHasil />} />
      <Route path="/admin/pantau" element={<AdminPantauAkun />} />
      <Route path="/profil-pengingat" element={<ProfilPengingat />} />
    </Routes>
  );
}

export default App;