import { Routes, Route } from 'react-router-dom';
import { Masuk } from './Login';
import Daftar from './Register';
import AdminPantauAkun from './Admin/AdminPantau';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Masuk />} />
      <Route path="/login" element={<Masuk />} />
      <Route path="/register" element={<Daftar />} />
      <Route path="/admin/pantau" element={<AdminPantauAkun />} />
    </Routes>
  );
}

export default App;