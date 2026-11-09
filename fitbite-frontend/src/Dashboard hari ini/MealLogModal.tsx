// @ts-nocheck
import React, { useState } from "react";

type MealLogModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (meal: { name: string; calories: number; time: string }) => void;
};

export const MealLogModal = ({ isOpen, onClose, onSave }: MealLogModalProps) => {
  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [time, setTime] = useState("Pagi");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !calories) return;
    onSave({ name, calories: Number(calories), time });
    setName("");
    setCalories("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-bold mb-4 text-[#203d32]">Catat Makanan Baru</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nama Makanan</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Nasi Goreng" 
              className="mt-1 w-full rounded-lg border border-[#e1e7df] p-2 text-sm outline-none focus:border-[#167653]"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Jumlah Kalori (kkal)</label>
            <input 
              type="number" 
              value={calories} 
              onChange={(e) => setCalories(e.target.value)}
              placeholder="Contoh: 450" 
              className="mt-1 w-full rounded-lg border border-[#e1e7df] p-2 text-sm outline-none focus:border-[#167653]"
              required 
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button 
              type="button" 
              onClick={onClose} 
              className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
            >
              Batal
            </button>
            <button 
              type="submit" 
              className="rounded-lg bg-[#167653] px-4 py-2 text-sm font-medium text-white hover:bg-[#126244]"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};