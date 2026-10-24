import { Routes, Route } from 'react-router-dom';
import { Masuk } from './Login';
import Daftar from './Register';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Masuk />} />
      <Route path="/login" element={<Masuk />} />
      <Route path="/register" element={<Daftar />} />
    </Routes>
  );
}

export default App;