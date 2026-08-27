import React, { useState } from 'react';
import { useMars } from '../context/MarsContext';
import { X, Building2, CheckCircle2, AlertCircle } from 'lucide-react';

interface AddPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddPropertyModal: React.FC<AddPropertyModalProps> = ({ isOpen, onClose }) => {
  const { addProperty } = useMars();

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [totalUnits, setTotalUnits] = useState('10');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !location.trim()) {
      setErrorMessage('Please provide property name and physical location.');
      return;
    }

    const units = parseInt(totalUnits, 10) || 1;

    addProperty({
      name,
      location,
      totalUnits: units,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-[#DFE8E3] w-full max-w-md overflow-hidden flex flex-col">
        <div className="p-5 bg-[#101915] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0AB77F] flex items-center justify-center text-white">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight">Add New Property</h3>
              <p className="text-xs text-[#9FB2A9]">Expand your real estate portfolio</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-[#D93838] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block font-bold text-[#17231E] mb-1">Property / Estate Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Kololo Royal Court"
              className="w-full px-3 py-2.5 bg-white border border-[#DFE8E3] rounded-xl text-xs font-semibold text-[#17231E] focus:outline-hidden focus:border-[#0AB77F]"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-[#17231E] mb-1">Physical Location / Address</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Plot 14 Acacia Avenue, Kololo"
              className="w-full px-3 py-2.5 bg-white border border-[#DFE8E3] rounded-xl text-xs font-semibold text-[#17231E] focus:outline-hidden focus:border-[#0AB77F]"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-[#17231E] mb-1">Total Rentable Units</label>
            <input
              type="number"
              value={totalUnits}
              onChange={(e) => setTotalUnits(e.target.value)}
              placeholder="10"
              min="1"
              className="w-full px-3 py-2.5 bg-white border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E] focus:outline-hidden focus:border-[#0AB77F]"
              required
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#DFE8E3]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#65766F] hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-extrabold text-white bg-[#0AB77F] hover:bg-[#07885E] shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Register Property
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
