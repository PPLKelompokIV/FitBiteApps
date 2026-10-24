import { Routes, Route } from 'react-router-dom';
import { Masuk } from './Login';
import Daftar from './Register';
import FotoAiTinjauHasil from './FotoAi';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Masuk />} />
      <Route path="/login" element={<Masuk />} />
      <Route path="/register" element={<Daftar />} />
      <Route path="/foto-ai" element={<FotoAiTinjauHasil />} />
    </Routes>
  );
}

export default App;