import { Routes, Route } from 'react-router-dom';
import { Masuk } from './Login';
import Daftar from './Register';
import BodyCheckPagi from './bodycheckpagi';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Masuk />} />
      <Route path="/login" element={<Masuk />} />
      <Route path="/register" element={<Daftar />} />
      <Route path="/bodycheckpagi" element={<BodyCheckPagi />} />
    </Routes>
  );
}

export default App;