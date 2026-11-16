import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Utensils,
  TrendingUp,
  Bell,
  Scale,
  Flame,
  Droplet,
  Flag,
  ChevronRight,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { HealthAppSidebarSection } from '../FotoAi/HealthAppSidebarSection';

interface DailyData {
  date: string;
  weight: number;
  intake: number;
  burned: number;
  waterPct: number;
  waterMl: number;
  waterTarget: number;
  isOngoing?: boolean;
}

const mockData14Days: DailyData[] = [
  { date: '6 Okt', weight: 64.8, intake: 1680, burned: 90, waterPct: 65, waterMl: 1716, waterTarget: 2640 },
  { date: '7 Okt', weight: 64.7, intake: 1320, burned: 40, waterPct: 94, waterMl: 2480, waterTarget: 2640 },
  { date: '8 Okt', weight: 64.7, intake: 1660, burned: 120, waterPct: 82, waterMl: 2165, waterTarget: 2640 },
  { date: '9 Okt', weight: 64.6, intake: 1710, burned: 170, waterPct: 70, waterMl: 2640, waterTarget: 2640 },
  { date: '10 Okt', weight: 64.7, intake: 2150, burned: 250, waterPct: 101, waterMl: 2666, waterTarget: 2640 },
  { date: '11 Okt', weight: 64.5, intake: 1640, burned: 45, waterPct: 93, waterMl: 2455, waterTarget: 2640 },
  { date: '12 Okt', weight: 64.4, intake: 1410, burned: 95, waterPct: 88, waterMl: 2323, waterTarget: 2640 },
  { date: '13 Okt', weight: 64.5, intake: 1690, burned: 160, waterPct: 100, waterMl: 2640, waterTarget: 2640 },
  { date: '14 Okt', weight: 64.3, intake: 1660, burned: 165, waterPct: 96, waterMl: 2534, waterTarget: 2640 },
  { date: '15 Okt', weight: 64.2, intake: 1890, burned: 45, waterPct: 105, waterMl: 2772, waterTarget: 2640 },
  { date: '16 Okt', weight: 64.3, intake: 1660, burned: 210, waterPct: 90, waterMl: 2376, waterTarget: 2640 },
  { date: '17 Okt', weight: 64.1, intake: 1630, burned: 155, waterPct: 94, waterMl: 2480, waterTarget: 2640 },
  { date: '18 Okt', weight: 64.0, intake: 1710, burned: 250, waterPct: 100, waterMl: 2640, waterTarget: 2640 },
  { date: '19 Okt*', weight: 64.0, intake: 1350, burned: 258, waterPct: 66, waterMl: 1750, waterTarget: 2640, isOngoing: true },
];

const daysByRange = { '7 hari': 7, '14 hari': 14, '30 hari': 30 } as const;

const renderGrafikTren = (data: DailyData[]) => (
  <ResponsiveContainer width="100%" height="100%">
    <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
      <defs>
        <linearGradient id="weightTrendFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1B6B45" stopOpacity={0.18} />
          <stop offset="100%" stopColor="#1B6B45" stopOpacity={0.01} />
        </linearGradient>
      </defs>
      <CartesianGrid stroke="#EEF2EE" vertical={false} />
      <XAxis
        dataKey="date"
        tickLine={false}
        axisLine={false}
        tick={{ fill: '#8C9A91', fontSize: 11 }}
        minTickGap={24}
      />
      <YAxis
        domain={['dataMin - 0.3', 'dataMax + 0.3']}
        tickLine={false}
        axisLine={false}
        tick={{ fill: '#8C9A91', fontSize: 11 }}
        tickFormatter={(value: number) => value.toLocaleString('id-ID', { maximumFractionDigits: 1 })}
        width={42}
      />
      <Tooltip
        formatter={(value) => [`${Number(value).toFixed(1)} kg`, 'Berat']}
        contentStyle={{ borderRadius: 12, borderColor: '#E4EAE3', fontSize: 12 }}
      />
      <Area
        type="monotone"
        dataKey="weight"
        stroke="#1B6B45"
        strokeWidth={2.5}
        fill="url(#weightTrendFill)"
        activeDot={{ r: 5, fill: '#1B6B45', stroke: '#FFFFFF', strokeWidth: 2 }}
      />
    </AreaChart>
  </ResponsiveContainer>
);

export default function ProgresPage() {
  const navigate = useNavigate();
  const [selectedRange, setSelectedRange] = useState<'7 hari' | '14 hari' | '30 hari'>('14 hari');
  const [progressData, setProgressData] = useState<DailyData[]>(mockData14Days);
  const [isSampleData, setIsSampleData] = useState(true);
  const days = daysByRange[selectedRange];

  useEffect(() => {
    const controller = new AbortController();
    const fallbackData = mockData14Days.slice(-days);

    const loadProgress = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/progress?days=${days}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`Server mengembalikan ${response.status}`);

        const data: unknown = await response.json();
        if (!Array.isArray(data) || data.length === 0) {
          throw new Error('Data progres dari server kosong atau formatnya tidak valid');
        }

        setProgressData(data.slice(-days) as DailyData[]);
        setIsSampleData(false);
      } catch (error) {
        if (controller.signal.aborted) return;

        console.warn('Data progres tidak tersedia; menampilkan data contoh.', error);
        setProgressData(fallbackData);
        setIsSampleData(true);
      }
    };

    void loadProgress();
    return () => controller.abort();
  }, [days]);

  const visibleProgressData = progressData.slice(-days);
  const latestData = visibleProgressData[visibleProgressData.length - 1];
  const firstData = visibleProgressData[0];
  const average = (selectValue: (day: DailyData) => number) =>
    visibleProgressData.length
      ? visibleProgressData.reduce((total, day) => total + selectValue(day), 0) / visibleProgressData.length
      : 0;
  const formatNumber = (value: number, maximumFractionDigits = 0) =>
    value.toLocaleString('id-ID', {
      minimumFractionDigits: maximumFractionDigits,
      maximumFractionDigits,
    });
  const averageIntake = average((day) => day.intake);
  const averageBurned = average((day) => day.burned);
  const averageHydration = average((day) => day.waterPct);
  const weightChange = latestData && firstData ? latestData.weight - firstData.weight : 0;
  const goalWeight = 60;
  const startingWeight = firstData?.weight ?? goalWeight;
  const goalDistance = startingWeight - goalWeight;
  const goalProgress = latestData
    ? goalDistance <= 0
      ? 100
      : Math.max(0, Math.min(100, ((startingWeight - latestData.weight) / goalDistance) * 100))
    : 0;
  const rangeLabel = `selama ${selectedRange}`;
  const trendLabel =
    Math.abs(weightChange) < 0.05
      ? 'Tren relatif stabil'
      : weightChange < 0
        ? 'Tren menurun bertahap'
        : 'Tren meningkat';

  return (
    <div className="min-h-screen flex bg-[#F4F6F2] text-[#1E2E26] font-sans">
      <HealthAppSidebarSection />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-white/70 backdrop-blur-sm border-b border-[#E4EAE3] px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2 text-xs">
            <span
              onClick={() => navigate('/dashboard-hari-ini')}
              className="text-[#8C9A91] hover:text-[#1E2E26] cursor-pointer"
            >
              Ruang sehat
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-[#8C9A91]" />
            <span className="font-semibold text-[#1E2E26]">Progres</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="px-3 py-1 rounded-full bg-[#ECEFE9] text-[#5C6B63] text-xs font-medium">
              {isSampleData ? 'Data contoh' : 'Data tersinkron'}
            </span>
            <button
              onClick={() => navigate('/profil-pengingat')}
              className="relative p-2 text-[#5C6B63] hover:bg-[#ECEFE9] rounded-full transition-colors"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#1B6B45]" />
            </button>
            <div
              onClick={() => navigate('/profil-pengingat')}
              className="w-8 h-8 rounded-full bg-[#E2F0E7] text-[#1B6B45] font-bold text-xs flex items-center justify-center cursor-pointer"
            >
              NP
            </div>
          </div>
        </header>

        {/* Dashboard Body */}
        <main className="p-8 max-w-6xl w-full mx-auto space-y-6">
          {/* Title & Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-[28px] font-bold text-[#172820] tracking-tight">
                Analytics progres
              </h1>
              <p className="text-xs text-[#7D8C84] mt-1">
                Tren dari {visibleProgressData.length} catatan {rangeLabel}. Ini bukan penilaian kesehatan.
              </p>
            </div>

            {/* Segmented Control */}
            <div className="inline-flex bg-[#E8ECE6] p-1 rounded-xl self-start">
              {(['7 hari', '14 hari', '30 hari'] as const).map((range) => (
                <button
                  key={range}
                  type="button"
                  aria-pressed={selectedRange === range}
                  onClick={() => setSelectedRange(range)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedRange === range
                      ? 'bg-white text-[#1B6B45] font-semibold shadow-sm'
                      : 'text-[#68776F] hover:text-[#1E2E26]'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          {/* 4 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#E6F2EA] border border-[#CFE4D6] rounded-2xl p-5">
              <div className="flex items-center justify-between text-xs font-medium text-[#546B5E] mb-2">
                <span>Berat terakhir</span>
                <Scale className="w-4 h-4 text-[#1B6B45]" />
              </div>
              <div className="text-2xl font-bold text-[#172820] mb-1.5">
                {formatNumber(latestData?.weight ?? 0, 1)} kg
              </div>
              <div className="text-[11px] text-[#546B5E]">
                {weightChange > 0 ? '+' : ''}{formatNumber(weightChange, 1)} kg {weightChange < 0 ? 'turun' : weightChange > 0 ? 'naik' : 'berubah'} {rangeLabel}
              </div>
            </div>

            <div className="bg-white border border-[#E4EAE3] rounded-2xl p-5">
              <div className="flex items-center justify-between text-xs font-medium text-[#7D8C84] mb-2">
                <span>Rerata asupan</span>
                <Utensils className="w-4 h-4 text-[#1B6B45]" />
              </div>
              <div className="text-2xl font-bold text-[#172820] mb-1.5">
                {formatNumber(Math.round(averageIntake))} kkal
              </div>
              <div className="text-[11px] text-[#8C9A91]">Rerata harian • {visibleProgressData.length} catatan</div>
            </div>

            <div className="bg-white border border-[#E4EAE3] rounded-2xl p-5">
              <div className="flex items-center justify-between text-xs font-medium text-[#7D8C84] mb-2">
                <span>Rerata terbakar</span>
                <Flame className="w-4 h-4 text-[#1B6B45]" />
              </div>
              <div className="text-2xl font-bold text-[#172820] mb-1.5">
                {formatNumber(Math.round(averageBurned))} kkal
              </div>
              <div className="text-[11px] text-[#8C9A91]">Rerata harian • {visibleProgressData.length} catatan</div>
            </div>

            <div className="bg-white border border-[#E4EAE3] rounded-2xl p-5">
              <div className="flex items-center justify-between text-xs font-medium text-[#7D8C84] mb-2">
                <span>Rerata hidrasi</span>
                <Droplet className="w-4 h-4 text-[#1B6B45]" />
              </div>
              <div className="text-2xl font-bold text-[#172820] mb-1.5">
                {formatNumber(Math.round(averageHydration))}%
              </div>
              <div className="text-[11px] text-[#8C9A91]">Rerata target harian tercapai</div>
            </div>
          </div>

          {/* Middle Section: Weight Chart + Goal Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 bg-white border border-[#E4EAE3] rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-base font-bold text-[#172820]">Tren berat badan</h2>
                <p className="text-xs text-[#7D8C84] mt-0.5">
                  Perubahan {rangeLabel}. Naik-turun harian bisa terjadi.
                </p>
                <div className="text-[11px] text-[#8C9A91] mt-4 mb-2">Berat badan (kg)</div>

                <div className="h-52 w-full pt-2">
                  {visibleProgressData.length > 0 ? renderGrafikTren(visibleProgressData) : (
                    <div className="flex h-full items-center justify-center text-xs text-[#8C9A91]">
                      Belum ada data untuk periode ini.
                    </div>
                  )}
                  </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-4 mt-4 border-t border-[#F0F3EF]">
                <span className="text-[11px] text-[#8C9A91]">
                  {visibleProgressData.length} catatan • berat diukur saat Body Check pagi
                </span>
                <span className="px-3 py-1 rounded-full bg-[#E8F3EC] text-[#1B6B45] text-xs font-semibold">
                  {trendLabel}
                </span>
              </div>
            </div>

            <div className="bg-white border border-[#E4EAE3] rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-base font-bold text-[#172820] mb-4">Menuju tujuanmu</h2>
                <div className="w-8 h-8 rounded-lg bg-[#E8F3EC] flex items-center justify-center text-[#1B6B45] mb-4">
                  <Flag className="w-4 h-4" />
                </div>

                <div className="text-3xl font-bold text-[#172820]">{formatNumber(goalWeight, 1)} kg</div>
                <div className="text-xs text-[#7D8C84] mt-1">Target yang kamu pilih</div>

                <div className="mt-6">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="font-medium text-[#3B4B43]">
                      Perjalanan dari {formatNumber(firstData?.weight ?? 0, 1)} kg
                    </span>
                    <span className="text-[#7D8C84] font-medium">{formatNumber(goalProgress)}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#E8ECE6] rounded-full overflow-hidden">
                    <div className="h-full bg-[#1B6B45] rounded-full" style={{ width: `${goalProgress}%` }} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-5 mt-5 border-t border-[#F0F3EF]">
                  <div>
                    <div className="text-[11px] text-[#8C9A91]">Sudah berubah</div>
                    <div className="text-base font-bold text-[#172820] mt-0.5">
                      {formatNumber(Math.abs(firstData && latestData ? firstData.weight - latestData.weight : 0), 1)} kg
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-[#8C9A91]">Menuju target</div>
                    <div className="text-base font-bold text-[#172820] mt-0.5">
                      {formatNumber(Math.max(0, (latestData?.weight ?? goalWeight) - goalWeight), 1)} kg
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-[#8C9A91] leading-relaxed mt-6">
                Tanpa tenggat kaku. Evaluasi tujuan bersama profesional bila perlu.
              </p>
            </div>
          </div>

          {/* Bottom Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-white border border-[#E4EAE3] rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-base font-bold text-[#172820]">Asupan &amp; energi terbakar</h2>
                <p className="text-xs text-[#7D8C84] mt-0.5">Perbandingan harian {rangeLabel}</p>

                <div className="flex items-center gap-4 text-[11px] mt-4 mb-4">
                  <div className="flex items-center gap-1.5 text-[#1B6B45] font-medium">
                    <span className="w-2 h-2 rounded-full bg-[#1B6B45]" />
                    Kalori masuk
                  </div>
                  <div className="flex items-center gap-1.5 text-[#C87D32] font-medium">
                    <span className="w-2 h-2 rounded-full bg-[#C87D32]" />
                    Kalori terbakar
                  </div>
                  <span className="text-[#8C9A91]">Satuan: kkal</span>
                </div>

                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={visibleProgressData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                      <CartesianGrid stroke="#EEF2EE" vertical={false} />
                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: '#8C9A91', fontSize: 10 }}
                        minTickGap={18}
                      />
                      <YAxis
                        domain={[0, 'auto']}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: '#8C9A91', fontSize: 10 }}
                        tickFormatter={(value: number) => value.toLocaleString('id-ID')}
                        width={42}
                      />
                      <Tooltip
                        formatter={(value, name) => [
                          `${formatNumber(Number(value))} kkal`,
                          name === 'intake' ? 'Kalori masuk' : 'Kalori terbakar',
                        ]}
                        contentStyle={{ borderRadius: 12, borderColor: '#E4EAE3', fontSize: 12 }}
                      />
                      <Bar dataKey="intake" name="intake" fill="#1B6B45" radius={[4, 4, 0, 0]}>
                        {visibleProgressData.map((day) => (
                          <Cell key={`intake-${day.date}`} fill={day.isOngoing ? '#94BEA8' : '#1B6B45'} />
                        ))}
                      </Bar>
                      <Bar dataKey="burned" name="burned" fill="#D68938" radius={[4, 4, 0, 0]}>
                        {visibleProgressData.map((day) => (
                          <Cell key={`burned-${day.date}`} fill={day.isOngoing ? '#E5BC8E' : '#D68938'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="text-[11px] text-[#8C9A91] pt-4 mt-4 border-t border-[#F0F3EF]">
                {latestData
                  ? `${latestData.date}: ${formatNumber(latestData.intake)} kkal masuk • ${formatNumber(latestData.burned)} kkal terbakar`
                  : 'Belum ada data kalori untuk periode ini.'}
              </div>
            </div>

            <div className="bg-white border border-[#E4EAE3] rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-base font-bold text-[#172820]">Konsistensi minum air</h2>
                <p className="text-xs text-[#7D8C84] mt-0.5">
                  Target berubah mengikuti berat dan olahraga intens
                </p>

                <div className="flex items-center gap-1.5 text-[11px] text-[#4C8DAE] font-medium mt-4 mb-4">
                  <span className="w-2 h-2 rounded-full bg-[#4C8DAE]" />
                  Persentase target air harian (dasar + bonus)
                </div>

                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={visibleProgressData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                      <CartesianGrid stroke="#EEF2EE" vertical={false} />
                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: '#8C9A91', fontSize: 10 }}
                        minTickGap={18}
                      />
                      <YAxis
                        domain={[0, 120]}
                        ticks={[0, 60, 120]}
                        tickFormatter={(value: number) => `${value}%`}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: '#8C9A91', fontSize: 10 }}
                        width={42}
                      />
                      <Tooltip
                        labelFormatter={(label) => String(label)}
                        formatter={(value) => [`${Number(value)}%`, 'Target air tercapai']}
                        contentStyle={{ borderRadius: 12, borderColor: '#E4EAE3', fontSize: 12 }}
                      />
                      <Bar dataKey="waterPct" fill="#4C8DAE" radius={[4, 4, 0, 0]}>
                        {visibleProgressData.map((day) => (
                          <Cell key={`water-${day.date}`} fill={day.isOngoing ? '#AECBD9' : '#4C8DAE'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="text-[11px] text-[#8C9A91] pt-4 mt-4 border-t border-[#F0F3EF]">
                {latestData
                  ? `${latestData.date}: ${formatNumber(latestData.waterMl)} / ${formatNumber(latestData.waterTarget)} ml • ${formatNumber(latestData.waterPct)}% tercapai`
                  : 'Belum ada data hidrasi untuk periode ini.'}
              </div>
            </div>
          </div>

          {/* Info Banner */}
          <div className="bg-[#E6F2EA] border border-[#CFE4D6] rounded-xl px-4 py-3 flex items-start sm:items-center gap-3">
            <TrendingUp className="w-4 h-4 text-[#1B6B45] shrink-0 mt-0.5 sm:mt-0" />
            <p className="text-xs text-[#2E5440]">
              {isSampleData
                ? `Data contoh yang tersedia berisi ${visibleProgressData.length} catatan untuk ${selectedRange}. Hubungkan data progres agar analitik mencerminkan catatanmu.`
                : `Grafik merangkum ${visibleProgressData.length} catatan ${rangeLabel}. Perubahan harian bisa terjadi; fokus pada kebiasaan yang dapat kamu pertahankan.`}
            </p>
          </div>

          {/* Bottom Disclaimer Footer */}
          <footer className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#8C9A91] pt-2 pb-6 gap-2">
            <span>FitBite mendukung kebiasaan sehat, bukan pengganti dokter atau ahli gizi.</span>
            <span>FitBite © 2026</span>
          </footer>
        </main>
      </div>
    </div>
  );
}