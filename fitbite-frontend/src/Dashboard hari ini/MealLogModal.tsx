import { useState, type FormEvent } from "react";

type MealLogForm = {
  name: string;
  calories: string;
  time: string;
};

export function MealLogModal({
  isOpen,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (meal: { name: string; time: string; calories: number }) => void;
}) {
  const [form, setForm] = useState<MealLogForm>({
    name: "",
    calories: "",
    time: "08:00",
  });

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = form.name.trim();
    const calories = Number(form.calories || 0);

    if (!trimmedName) {
      return;
    }

    onSave({
      name: trimmedName,
      time: form.time,
      calories,
    });

    setForm({ name: "", calories: "", time: "08:00" });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#203d32]/45 px-4 backdrop-blur-[2px]">
      <div className="w-full max-w-md rounded-[20px] border border-[#e1e7df] bg-white p-5 shadow-[0_18px_45px_rgba(20,40,30,0.16)]">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-lg font-bold text-[#203d32]">Catat makanan</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-medium text-[#728078] transition hover:text-[#203d32]"
          >
            Tutup
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm text-[#203d32]">
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-[#728078]">
              Nama makanan
            </span>
            <input
              type="text"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Contoh: Salad sayur"
              className="w-full rounded-xl border border-[#dfe7de] bg-[#f8faf6] px-3 py-2.5 text-sm text-[#203d32] outline-none transition focus:border-[#167653]"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm text-[#203d32]">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-[#728078]">
                Kalori
              </span>
              <input
                type="number"
                min="0"
                value={form.calories}
                onChange={(event) => setForm((current) => ({ ...current, calories: event.target.value }))}
                placeholder="350"
                className="w-full rounded-xl border border-[#dfe7de] bg-[#f8faf6] px-3 py-2.5 text-sm text-[#203d32] outline-none transition focus:border-[#167653]"
              />
            </label>

            <label className="block text-sm text-[#203d32]">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-[#728078]">
                Waktu
              </span>
              <input
                type="time"
                value={form.time}
                onChange={(event) => setForm((current) => ({ ...current, time: event.target.value }))}
                className="w-full rounded-xl border border-[#dfe7de] bg-[#f8faf6] px-3 py-2.5 text-sm text-[#203d32] outline-none transition focus:border-[#167653]"
              />
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="min-h-10 rounded-[10px] border border-[#e1e7df] bg-white px-3 text-xs font-semibold text-[#728078] transition hover:bg-[#f5f8f3]"
            >
              Batal
            </button>
            <button
              type="submit"
              className="min-h-10 rounded-[10px] bg-[#167653] px-4 text-xs font-semibold text-white transition hover:bg-[#126244]"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
