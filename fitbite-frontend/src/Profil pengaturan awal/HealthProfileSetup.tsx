import React, { useState } from 'react';

const HealthProfileSetup = () => {
  const [formData, setFormData] = useState({
    tanggalLahir: '',
    jenisKelamin: 'Perempuan',
    tinggiBadan: '',
    beratAwal: '',
    targetBerat: '',
    aktivitas: 'Ringan — banyak duduk, aktif 1-3 hari per minggu',
    tujuan: 'Turunkan berat badan',
    syaratKetentuan: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckbox = (e) => {
    setFormData((prev) => ({ ...prev, syaratKetentuan: e.target.checked }));
  };

  const handleTujuanClick = (tujuan) => {
    setFormData((prev) => ({ ...prev, tujuan }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Data Profil Kesehatan:', formData);
    // TODO: Kirim data ke API backend
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col font-sans">
      
      {/* HEADER (Full Width) */}
      <header className="w-full bg-white flex items-center justify-between px-10 py-5 border-b border-gray-200 z-10 shrink-0">
        <div className="flex items-center gap-2">
          <div className="bg-[#18553E] text-white p-1.5 rounded-md">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="font-bold text-2xl text-[#18553E] tracking-tight">FitBite</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="bg-gray-100 px-3 py-1 rounded-md text-xs font-medium text-gray-600">Data contoh • 5 Okt 2026</span>
          <span className="text-gray-700">Nadia Putri</span>
          <span>•</span>
          <button className="hover:text-red-500 transition-colors">Keluar</button>
        </div>
      </header>

      {/* CONTENT WRAPPER */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* SIDEBAR KIRI */}
        <aside className="w-[420px] bg-[#F8FAF9] p-12 border-r border-gray-200 flex flex-col justify-between overflow-y-auto shrink-0">
          <div>
            <p className="text-[11px] font-bold text-[#18553E] tracking-widest uppercase mb-4">Kenali Dirimu</p>
            <h1 className="text-4xl font-bold text-gray-900 leading-[1.2] mb-6">
              Kebutuhanmu,<br />bukan angka<br />orang lain.
            </h1>
            <p className="text-sm text-gray-500 mb-12 leading-relaxed">
              Beberapa detail membantu kami<br />menyiapkan titik awal yang lebih personal.
            </p>

            {/* Stepper */}
            <div className="relative border-l border-gray-200 ml-[11px] space-y-10">
              {/* Step 1 */}
              <div className="relative flex items-start gap-5 -ml-[12px]">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E8F3ED] text-[#18553E] mt-0.5">
                   <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Buat akun</p>
                  <p className="text-xs text-gray-400 mt-1">Selesai</p>
                </div>
              </div>
              {/* Step 2 */}
              <div className="relative flex items-start gap-5 -ml-[12px]">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#18553E] text-white mt-0.5">
                  <span className="text-xs font-bold">2</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Profil kesehatan</p>
                  <p className="text-xs text-gray-400 mt-1">Sedang diisi</p>
                </div>
              </div>
              {/* Step 3 */}
              <div className="relative flex items-start gap-5 -ml-[12px]">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#F3F4F6] text-gray-400 mt-0.5">
                  <span className="text-xs font-bold">3</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-500">Body Check pagi</p>
                  <p className="text-xs text-gray-400 mt-1">Langkah berikutnya</p>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="mt-12 bg-[#E8F3ED] rounded-xl p-5 flex gap-3">
               <svg className="w-5 h-5 text-[#18553E] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
               </svg>
               <p className="text-[13px] text-[#18553E] font-medium leading-relaxed">
                 Profil dan catatan kesehatan hanya dapat dilihat olehmu. Administrator tidak memiliki akses.
               </p>
            </div>
          </div>
          
          <p className="text-xs text-gray-400 mt-8">Bisa diubah kapan saja melalui Profil & pengingat.</p>
        </aside>

        {/* AREA FORM KANAN */}
        <main className="flex-1 bg-white p-12 overflow-y-auto">
          <div className="max-w-[850px]">
            
            <div className="flex justify-between items-end mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Lengkapi profil kesehatan</h2>
              <span className="bg-[#E8F3ED] text-[#18553E] text-[11px] font-bold px-3 py-1.5 rounded-full">Langkah 2 dari 3</span>
            </div>

            <form onSubmit={handleSubmit}>
              
              {/* Section: Tentang Tubuhmu */}
              <div className="border border-gray-200 rounded-[16px] p-8 mb-8 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Tentang tubuhmu</h3>
                <p className="text-sm text-gray-500 mb-6">Gunakan kondisi saat ini. Semua angka dapat diperbarui.</p>
                
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Tanggal lahir</label>
                    <input type="date" name="tanggalLahir" value={formData.tanggalLahir} onChange={handleChange} className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-1 focus:ring-[#18553E] focus:border-[#18553E] outline-none transition-all text-gray-700" />
                    <p className="text-[11px] text-gray-400 mt-2">Usia saat ini: 28 tahun</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Jenis kelamin untuk perhitungan</label>
                    <select name="jenisKelamin" value={formData.jenisKelamin} onChange={handleChange} className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-1 focus:ring-[#18553E] focus:border-[#18553E] outline-none transition-all bg-white text-gray-700">
                      <option value="Perempuan">Perempuan</option>
                      <option value="Laki-laki">Laki-laki</option>
                    </select>
                    <p className="text-[11px] text-gray-400 mt-2">Digunakan dalam rumus kebutuhan energi.</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Tinggi badan</label>
                    <div className="relative">
                      <input type="number" name="tinggiBadan" value={formData.tinggiBadan} onChange={handleChange} className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-1 focus:ring-[#18553E] focus:border-[#18553E] outline-none transition-all text-gray-700" placeholder="160" />
                      <span className="absolute right-4 top-3.5 text-sm text-gray-400">cm</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Berat awal / saat ini</label>
                    <div className="relative">
                      <input type="number" name="beratAwal" value={formData.beratAwal} onChange={handleChange} className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-1 focus:ring-[#18553E] focus:border-[#18553E] outline-none transition-all text-gray-700" placeholder="64,8" step="0.1" />
                      <span className="absolute right-4 top-3.5 text-sm text-gray-400">kg</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Target berat badan</label>
                    <div className="relative">
                      <input type="number" name="targetBerat" value={formData.targetBerat} onChange={handleChange} className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-1 focus:ring-[#18553E] focus:border-[#18553E] outline-none transition-all text-gray-700" placeholder="60" step="0.1" />
                      <span className="absolute right-4 top-3.5 text-sm text-gray-400">kg</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Tingkat aktivitas rutin</label>
                  <select name="aktivitas" value={formData.aktivitas} onChange={handleChange} className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-1 focus:ring-[#18553E] focus:border-[#18553E] outline-none transition-all bg-white text-gray-700">
                    <option value="Ringan — banyak duduk, aktif 1-3 hari per minggu">Ringan — banyak duduk, aktif 1-3 hari per minggu</option>
                    <option value="Sedang — aktif 3-5 hari per minggu">Sedang — aktif 3-5 hari per minggu</option>
                    <option value="Tinggi — aktif olahraga tiap hari">Tinggi — aktif olahraga tiap hari</option>
                  </select>
                </div>
              </div>

              {/* Section: Tujuan Utama */}
              <div className="border border-gray-200 rounded-[16px] p-8 mb-8 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Apa tujuan utamamu?</h3>
                <p className="text-sm text-gray-500 mb-6">Kami sesuaikan targetnya, kamu tentukan langkahnya.</p>
                
                <div className="grid grid-cols-3 gap-5">
                  {[
                    { id: 'Turunkan berat badan', desc: 'Defisit energi yang bertahap', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
                    { id: 'Pertahankan berat badan', desc: 'Jaga pola yang seimbang', icon: 'M4 8h16M4 16h16' },
                    { id: 'Tambah massa otot', desc: 'Dukung latihan dan pemulihan', icon: 'M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3' }
                  ].map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => handleTujuanClick(item.id)}
                      className={`cursor-pointer border rounded-xl p-5 transition-all relative ${formData.tujuan === item.id ? 'border-[#18553E] bg-[#EEF5F1]' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                       <svg className={`w-6 h-6 mb-8 ${formData.tujuan === item.id ? 'text-[#18553E]' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}></path></svg>
                      
                      {/* Radio indicator */}
                      <div className={`absolute top-5 right-5 w-4 h-4 rounded-full border flex items-center justify-center ${formData.tujuan === item.id ? 'border-[#18553E]' : 'border-gray-300'}`}>
                         {formData.tujuan === item.id && <div className="w-2 h-2 bg-[#18553E] rounded-full"></div>}
                      </div>

                      <p className={`text-sm font-bold mb-1 ${formData.tujuan === item.id ? 'text-[#18553E]' : 'text-gray-700'}`}>{item.id}</p>
                      <p className="text-[12px] text-gray-500">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-[#EEF5F1] p-5 rounded-xl flex items-start gap-3 mb-8">
                 <svg className="w-5 h-5 text-[#18553E] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                 <p className="text-[13px] text-[#18553E] font-medium leading-relaxed">
                   Target awal dihitung dari BMR Mifflin-St Jeor dan tingkat aktivitas. Body Check membantu menyesuaikan estimasi kebutuhan harian, bukan menilai kondisi medis.
                 </p>
              </div>

              {/* Submit Area */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleCheckbox({ target: { checked: !formData.syaratKetentuan } })}>
                  <div className={`w-5 h-5 rounded-[4px] border flex items-center justify-center ${formData.syaratKetentuan ? 'bg-[#18553E] border-[#18553E]' : 'border-gray-300'}`}>
                    {formData.syaratKetentuan && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <label className="text-xs text-gray-500 cursor-pointer select-none">
                    Saya setuju profil digunakan untuk personalisasi target.
                  </label>
                </div>

                <button 
                  type="submit" 
                  disabled={!formData.syaratKetentuan}
                  className="bg-[#18553E] hover:bg-[#12422F] disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed text-white text-sm font-bold py-3.5 px-6 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
                >
                  Simpan & lanjutkan
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </button>
              </div>
              
              <div className="mt-16 border-t border-gray-100 pt-8">
                <p className="text-[11px] text-gray-400">FitBite mendukung kebiasaan sehat, bukan pengganti dokter atau ahli gizi.</p>
              </div>

            </form>
          </div>
        </main>

      </div>
    </div>
  );
};

export default HealthProfileSetup;